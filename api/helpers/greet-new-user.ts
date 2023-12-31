import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";
import { VercelResponse } from "@vercel/node";
import { t } from "i18next";

export default async function greetNewUser(res: VercelResponse, body: ReqBody) {
  const answer: ResBody = {
    version: body.version,
    response: {
      text: t('greet_new_user'),
      end_session: false,
    },
  };

  end(res, answer);
}
