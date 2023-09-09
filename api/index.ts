import { TodoistApi } from "@doist/todoist-api-typescript";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ReqBody, ResBody } from "alice-types";
import pluralize from "../utils/pluralize";

// TODO: extract business logic
// TODO: handle errors
// TODO: if todoist api returns error caused by auth -> request auth from the user
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = req.body as ReqBody;
  const { request, version } = body;

  const supportsAuth = Boolean(body.meta.interfaces.account_linking);
  if (!supportsAuth) {
    const response: ResBody = {
      version,
      response: {
        text: "Извините, эта поверхность не поддерживает авторизацию. Попробуйте запустить навык с телефона",
        end_session: true, // TODO: check that it's ok
      },
    };
    res.end(JSON.stringify(response));
    return;
  }

  const authenticated = Boolean(
    // TODO: uncomment or remove
    // req.headers.authorization ||
    body.session.user?.access_token
  );

  // @ts-ignore
  if (authenticated && body.account_linking_complete_event) {
    const apiToken = body.session.user?.access_token || "";
    const api = new TodoistApi(apiToken);
    const tasks = await api.getTasks();

    // TODO: add yandex user name (fetch it by id)
    const text = tasks.length
      ? `Добро пожаловать!\nУ вас ${tasks.length} ${pluralize(tasks.length, [
          "невыполненная",
          "невыполненных",
          "невыполненных",
        ])} ${pluralize(tasks.length, [
          "задача",
          "задачи",
          "задач",
        ])}.\nСкажите "мои задачи", чтобы узнать, ${pluralize(tasks.length, [
          "какая",
          "каких",
          "каких",
        ])} именно`
      : `Добро пожаловать!\nВсе задачи выполнены, так держать!\nСкажите "создай задачу", чтобы создать новую`;
    // TODO: respond with this if original_utterance is empty, and replace this with greeting
    const response: ResBody = {
      version,
      response: {
        text,
        end_session: false,
      },
    };

    res.end(JSON.stringify(response));
    return;
  }

  if (!authenticated) {
    const response: ResBody = {
      version,
      // @ts-ignore
      start_account_linking: {},
    };
    res.end(JSON.stringify(response));
    return;
  }

  const response: ResBody = {
    version,
    response: {
      // В свойстве response.text возвращается исходная реплика пользователя.
      // Если навык был активирован без дополнительной команды,
      // пользователю нужно сказать "Hello!".
      text: request.original_utterance || "Bye!",

      // Свойство response.end_session возвращается со значением false,
      // чтобы диалог не завершался.
      end_session: false,
    },
  };

  res.end(JSON.stringify(response));
}
