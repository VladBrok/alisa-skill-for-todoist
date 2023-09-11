import { VercelResponse } from "@vercel/node";
import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";
import getApi from "./get-api";
import formatTaskContent from "../../utils/format-task-content";

const PAGE_SIZE = 7; // TODO: set to 10

export default async function handleUtterance(
  res: VercelResponse,
  body: ReqBody
) {
  const intents = body.request.nlu?.intents;
  const isGetTasks = intents?.["get_tasks"];
  const isNextPage = intents?.["next_page"];
  const isPrevPage = intents?.["prev_page"];
  let responseText = "";
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
      : `Все задачи выполнены. Так держать!\nСоздайте новую задачу, сказав "создай задачу"`;
    responseTts = responseText
      .replaceAll("\n\n\n", " sil <[400]> ")
      .replaceAll("\n\n", " sil <[200]> ")
      .replaceAll("\n", " sil <[100]> ");
  } else {
    responseText = `Извините, не поняла Вас.\nСкажите "что ты умеешь" для просмотра возможных действий`;
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
