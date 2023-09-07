// import { TodoistApi } from "@doist/todoist-api-typescript";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ReqBody, ResBody } from "alice-types";
import dotenv from "dotenv";
dotenv.config();

// const apiToken = process.env["TODOIST_TOKEN"];

// if (!apiToken) {
//   throw new Error("TODOIST_TOKEN was not provided");
// }

// const api = new TodoistApi(apiToken);

// api
//   .getTasks()
//   .then((tasks) => console.log(tasks))
//   .catch((error) => console.log(error));

// TODO: extract business logic
export default function handler(req: VercelRequest, res: VercelResponse) {
  const body = req.body as ReqBody;
  const { request, version } = body;

  const supportsAuth = Boolean(body.meta.interfaces.account_linking);
  if (!supportsAuth) {
    const response: ResBody = {
      version,
      response: {
        text: "Извините, эта поверхность не поддерживает авторизацию. Попробуйте запустить навык с телефона",
        end_session: true, // TODO: check that it's oks
      },
    };
    res.end(JSON.stringify(response));
    return;
  }

  const authenticated = false; // TODO
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
