import { VercelResponse } from "@vercel/node";
import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";
import getApi from "./get-api";

export default async function handleUtterance(
  res: VercelResponse,
  body: ReqBody
) {
  const intents = body.request.nlu?.intents;
  const isGetTasks = intents?.["get_tasks"];

  if (isGetTasks) {
    const api = getApi(body);
    const tasks = await api.getTasks();
    const text = tasks.length
      ? `${tasks
          .map((task) => task.content)
          .join(
            "\n"
          )}\nСкажите "закрой задачу" и название задачи, чтобы отметить её как выполненную`
      : `Все задачи выполнены. Так держать!\nСоздайте новую задачу, сказав "создай задачу"`;

    const answer: ResBody = {
      version: body.version,
      response: {
        text,
        end_session: false,
      },
    };
    end(res, answer);
    return;
  }

  const answer: ResBody = {
    version: body.version,
    response: {
      text: `Извините, не поняла Вас. Скажите "что ты умеешь" для просмотра возможных действий`,
      end_session: false,
    },
  };
  end(res, answer);
}
