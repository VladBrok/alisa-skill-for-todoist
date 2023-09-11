import pluralize from "../../utils/pluralize";
import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";
import { VercelResponse } from "@vercel/node";
import getApi from "./get-api";

export default async function greetKnownUser(
  res: VercelResponse,
  body: ReqBody
) {
  const api = getApi(body);
  const tasks = await api.getTasks();
  const taskCount = tasks.length;

  const text = taskCount
    ? `С возвращением!\nУ Вас ${taskCount} ${pluralize(taskCount, [
        "невыполненная",
        "невыполненных",
        "невыполненных",
      ])} ${pluralize(taskCount, [
        "задача",
        "задачи",
        "задач",
      ])}.\nСкажите "задачи", чтобы узнать, ${pluralize(taskCount, [
        "какая",
        "каких",
        "каких",
      ])} именно`
    : `С возвращением!\nВсе задачи выполнены, так держать!\nСкажите "создай задачу", чтобы создать новую`;

  const answer: ResBody = {
    version: body.version,
    response: {
      text,
      end_session: false,
    },
  };

  end(res, answer);
}
