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

// Для асинхронной работы используется пакет micro.
// const { json } = require("micro");

export default function handler(req: any, res: any) {
  console.log("THE REQUEST:", req);
  // Из запроса извлекаются свойства request, session и version.
  const { request, session, version } = req.body;

  // В тело ответа вставляются свойства version и session из запроса.
  // Подробнее о формате запроса и ответа — в разделе Протокол работы навыка.
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

// // Запуск асинхронного сервиса.
// module.exports = async (req:any, res:any) => {
//   // Из запроса извлекаются свойства request, session и version.
//   const { request, session, version } = await json(req);

//   // В тело ответа вставляются свойства version и session из запроса.
//   // Подробнее о формате запроса и ответа — в разделе Протокол работы навыка.
//   res.end(
//     JSON.stringify({
//       version,
//       session,
//       response: {
//         // В свойстве response.text возвращается исходная реплика пользователя.
//         // Если навык был активирован без дополнительной команды,
//         // пользователю нужно сказать "Hello!".
//         text: request.original_utterance || "Hello!",

//         // Свойство response.end_session возвращается со значением false,
//         // чтобы диалог не завершался.
//         end_session: false,
//       },
//     })
//   );
// };
