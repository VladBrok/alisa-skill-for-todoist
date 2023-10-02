import type { VercelResponse } from "@vercel/node";
import { ReqBody } from "alice-types";
import end from "./end-response";

export function pong(res: VercelResponse, body: ReqBody) {
  end(res, {
    version: body.version,
    response: {
      text: "pong",
      end_session: false,
    },
  });
}
