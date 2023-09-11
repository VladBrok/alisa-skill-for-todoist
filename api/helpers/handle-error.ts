import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";
import { VercelResponse } from "@vercel/node";

export default function handleError(
  e: unknown,
  res: VercelResponse,
  body: ReqBody
) {
  console.error(e); // TODO: report error
  const answer: ResBody = {
    version: body.version,
    response: {
      text: 'Ой, я не смогла обработать запрос.\nПожалуйста, повторите его, или скажите "что ты умеешь" для просмотра доступных действий',
      end_session: false,
    },
  };
  end(res, answer);
}
