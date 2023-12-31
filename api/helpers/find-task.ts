import { ReqBody } from "alice-types";
import getApi from "./get-api";
import formatTaskList from "../../utils/format-task-list";
import formatTaskContent from "../../utils/format-task-content";
import { t } from "i18next";
import applyTts from "../../utils/apply-tts";
import { Task, TodoistApi } from "@doist/todoist-api-typescript";
import { PAGE_SIZE } from "../../constants";

interface SearchResult {
  responseText: string;
  responseTts: string;
}

export default async function findTask(
  content: string,
  body: ReqBody,
  onFound: (task: Task, api: TodoistApi) => Promise<SearchResult>
): Promise<SearchResult> {
  const api = getApi(body);

  const tasks = await api.getTasks({
    filter: `поиск: ${content}`,
    lang: "ru",
  });

  if (tasks.length === 1) {
    return await onFound(tasks[0]!, api);
  } else if (tasks.length === 0) {
    return {
      responseText: t("task_not_found", {
        taskContent: formatTaskContent(content),
      }),
      responseTts: "",
    };
  } else {
    const formatted = formatTaskList(tasks, PAGE_SIZE);
    const responseText = t("multiple_tasks_found", {
      tasks: formatted,
    });
    const responseTts = applyTts(responseText);
    return {
      responseText,
      responseTts,
    };
  }
}
