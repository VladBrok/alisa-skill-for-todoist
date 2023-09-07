// import { TodoistApi } from "@doist/todoist-api-typescript";
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

export default function handler(req: any, res: any) {
  const { request, session, version } = req.body;

  res.end(
    JSON.stringify({
      version,
      session,
      response: {
        // В свойстве response.text возвращается исходная реплика пользователя.
        // Если навык был активирован без дополнительной команды,
        // пользователю нужно сказать "Hello!".
        text: request.original_utterance || "Hello!",

        // Свойство response.end_session возвращается со значением false,
        // чтобы диалог не завершался.
        end_session: false,
      },
    })
  );
}
