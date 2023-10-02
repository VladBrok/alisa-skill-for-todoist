import { VercelResponse } from "@vercel/node";
import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";
import { t } from "i18next";

export default function authNotSupported(res: VercelResponse, body: ReqBody) {
  const answer: ResBody = {
    version: body.version,
    response: {
      text: t("auth_not_supported"),
      end_session: true,
    },
  };
  end(res, answer);
}
