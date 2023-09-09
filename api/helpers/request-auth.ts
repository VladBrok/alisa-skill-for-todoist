import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";
import { VercelResponse } from "@vercel/node";

export default function requestAuth(res: VercelResponse, body: ReqBody) {
  const answer: ResBody = {
    version: body.version,
    // @ts-ignore
    start_account_linking: {},
  };
  end(res, answer);
}
