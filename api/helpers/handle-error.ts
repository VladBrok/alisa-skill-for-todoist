import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";
import { VercelResponse } from "@vercel/node";
import requestAuth from "./request-auth";

export default function handleError(
  e: unknown,
  res: VercelResponse,
  body: ReqBody
) {
  console.error(e); // TODO: report an error

  if ((e as any).httpStatusCode == 401) {
    requestAuth(res, body);
    return;
  }

  const answer: ResBody = {
    version: body.version,
    response: {
      text: 'Ой, я не смогла обработать запрос.\nПожалуйста, повторите его, или скажите "что ты умеешь" для просмотра доступных действий',
      end_session: false,
    },
  };
  end(res, answer);
}
