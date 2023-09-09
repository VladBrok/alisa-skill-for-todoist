import { VercelResponse } from "@vercel/node";
import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";

export default function handleUtterance(res: VercelResponse, body: ReqBody) {
  const answer: ResBody = {
    version: body.version,
    response: {
      text: "Не реализовано",
      end_session: true, // TODO: return false
    },
  };
  end(res, answer);
}
