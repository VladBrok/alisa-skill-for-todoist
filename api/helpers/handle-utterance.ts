import { VercelResponse } from "@vercel/node";
import { ReqBody, ResBody } from "alice-types";
import { t } from "i18next";
import end from "./end-response";
import getApi from "./get-api";
import formatTaskContent from "../../utils/format-task-content";
import formatTaskList from "../../utils/format-task-list";
import applyTts from "../../utils/apply-tts";

const PAGE_SIZE = 2; // TODO: set to 10

export default async function handleUtterance(
  res: VercelResponse,
  body: ReqBody
) {
  const intents = body.request.nlu?.intents;
  const isGetTasks = intents?.["get_tasks"];
  const isNextPage = intents?.["next_page"];
  const isPrevPage = intents?.["prev_page"];
  const isCreateTask = intents?.["create_task"];
  const isCloseTask = intents?.["close_task"];
  const isUpdateTask = intents?.["update_task"];
  let responseText = t("unhandle_utterance");
  let responseTts = "";

  let page = Number(body.state?.session?.["page"]);
  if (Number.isNaN(page) || page < 1) {
    page = 1;
  }
  if (isNextPage) {
    page++;
  }
  if (isPrevPage) {
    page--;
  }

  if (isGetTasks || isNextPage || isPrevPage) {
    const dateFilter = (
      intents?.["get_tasks"]?.slots?.["when"]?.value || ""
    ).toString();
    const api = getApi(body);
    const tasks = await api.getTasks({
      ...(Boolean(dateFilter) && { filter: dateFilter, lang: "ru" }),
    });

    const totalPages = Math.max(Math.ceil(tasks.length / PAGE_SIZE), 1);
    if (isGetTasks) {
      page = 1;
    }

    let skip = (page - 1) * PAGE_SIZE;
    let tasksInPage = tasks.slice(skip, PAGE_SIZE + skip);
    if (!tasksInPage.length) {
      page = 1;
      skip = (page - 1) * PAGE_SIZE;
      tasksInPage = tasks.slice(skip, PAGE_SIZE + skip);
    }

    if (tasksInPage.length) {
      responseText = formatTaskList(tasksInPage);

      if (totalPages > 1) {
        let pageFooter =
          t("current_page", {
            page,
            totalPages,
          }) + "\n";
        if (page < totalPages) {
          pageFooter += t("next_page") + "\n";
        }
        if (page > 1) {
          pageFooter += t("prev_page") + "\n";
        }
        responseText += pageFooter;
      }

      responseText += t("close_task");
    } else {
      responseText = t("all_tasks_done", {
        type: dateFilter ? "with_date" : "other",
      });
    }

    responseTts = applyTts(responseText);
  } else if (isCreateTask) {
    const slots = intents?.["create_task"]?.slots;
    let content = slots?.["content"]?.value.toString() || "";
    let dueString = slots?.["dueString"]?.value.toString() || "";

    /**  
      Todoist API is not able to extract date from string like "помыть окно завтра",
      it requires to explicitly set `dueString`. Because of this, we use `dueSeparator`
      to distinguish between the task content and the task date.
      If the user hasn't specified the `dueSeparator` (word "срок"),
      we assume that both `content` and `dueString` have the task `content`, and `dueString` is not specified in this case.
    */
    const dueSeparatorsCount =
      body.request.nlu?.tokens.filter((x) => x === "срок").length || 0;
    const hasDueSeparator = dueSeparatorsCount > 0;
    if (!hasDueSeparator) {
      content += ` ${dueString}`;
      dueString = "";
    }
    if (dueSeparatorsCount > 1) {
      content += " срок";
    }

    if (content) {
      const api = getApi(body);

      try {
        await api.addTask({
          content,
          ...(Boolean(dueString) && { dueString, dueLang: "ru" }),
        });
      } catch (e) {
        if (
          (e as any).responseData
            .toString()
            .trim()
            .toLowerCase()
            .includes("invalid date format")
        ) {
          content += `${
            hasDueSeparator && !content.includes("срок") ? " срок" : ""
          } ${dueString}`;
          dueString = "";
          await api.addTask({
            content,
          });
        } else {
          throw e;
        }
      }

      responseText = t("task_created", {
        taskContent: formatTaskContent(content),
        due: dueString || "empty",
      });
    }
  } else if (isCloseTask) {
    const slots = intents?.["close_task"]?.slots;
    const content = slots?.["taskName"]?.value.toString() || "";

    const api = getApi(body);
    const tasks = await api.getTasks({
      filter: `поиск: ${content}`,
      lang: "ru",
    });

    if (tasks.length === 1) {
      const task = tasks[0]!;
      const closed = await api.closeTask(task.id);

      if (!closed) {
        throw new Error(`Todoist API returned false from closeTask endpoint.`);
      }

      responseText = t("task_closed", {
        taskContent: formatTaskContent(task.content),
      });
    } else if (tasks.length === 0) {
      responseText = t("task_not_found", {
        taskContent: formatTaskContent(content),
      });
    } else {
      const formatted = formatTaskList(tasks);
      responseText = t("multiple_tasks_found", {
        tasks: formatted,
      });
      responseTts = applyTts(responseText);
    }
  } else if (isUpdateTask) {
    // TODO: duplicate logic with `isCloseTask`

    const slots = intents?.["update_task"]?.slots;
    const oldContent = slots?.["old"]?.value.toString() || "";
    const newContent = slots?.["new"]?.value.toString() || "";

    const api = getApi(body);
    const tasks = await api.getTasks({
      filter: `поиск: ${oldContent}`,
      lang: "ru",
    });

    if (tasks.length === 1) {
      const task = tasks[0]!;
      const updated = await api.updateTask(task.id, {
        content: newContent,
      });

      if (!updated) {
        throw new Error(`Todoist API returned false from updateTask endpoint.`);
      }

      responseText = t("task_updated", {
        oldContent: formatTaskContent(task.content),
        newContent: formatTaskContent(newContent),
      });
    } else if (tasks.length === 0) {
      responseText = t("task_not_found", {
        taskContent: formatTaskContent(oldContent),
      });
    } else {
      const formatted = formatTaskList(tasks);
      responseText = t("multiple_tasks_found", {
        tasks: formatted,
      });
      responseTts = applyTts(responseText);
    }
  }

  const answer: ResBody = {
    version: body.version,
    response: {
      text: responseText,
      end_session: false,
      ...(Boolean(responseTts) && { tts: responseTts }),
    },
    session_state: {
      page,
    },
  };
  end(res, answer);
}
