import { VercelResponse } from "@vercel/node";
import { ReqBody, ResBody } from "alice-types";
import { t } from "i18next";
import end from "./end-response";
import getApi from "./get-api";
import formatTaskContent from "../../utils/format-task-content";

const PAGE_SIZE = 10;

export default async function handleUtterance(
  res: VercelResponse,
  body: ReqBody
) {
  const intents = body.request.nlu?.intents;
  const isGetTasks = intents?.["get_tasks"];
  const isNextPage = intents?.["next_page"];
  const isPrevPage = intents?.["prev_page"];
  const isCreateTask = intents?.["create_task"];
  let responseText = t('unhandle_utterance');
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
    const api = getApi(body);
    const tasks = await api.getTasks();

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

    responseText = tasksInPage.length
      ? `${tasksInPage
          .map((task) => formatTaskContent(task.content))
          .join("\n\n")}\n\n\n${
          totalPages > 1
            ? `Страница ${page} из ${totalPages}. ${
                page < totalPages
                  ? 'Для перехода на следующую, скажите "дальше"\n'
                  : ""
              }${page > 1 ? 'Для перехода назад, скажите "назад"\n' : ""}`
            : ""
        }Для закрытия задачи, скажите "закрой задачу" и её название`
      : t('all_tasks_done');
    responseTts = responseText
      .replaceAll("\n\n\n", " sil <[400]> ")
      .replaceAll("\n\n", " sil <[200]> ")
      .replaceAll("\n", " sil <[100]> ");
  } else if (isCreateTask) {
    const slots = body.request.nlu?.intents?.["create_task"]?.slots;
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

      responseText = t('task_created', { 
        taskContent: formatTaskContent(content),
        // не знаю, как корректнее это сделать, т.к. ICU в select не поддерживает undefined или что-то подобное
        due: dueString ? dueString : "empty"
      })
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
