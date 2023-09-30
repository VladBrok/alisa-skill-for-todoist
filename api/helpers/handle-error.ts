import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";
import { VercelResponse } from "@vercel/node";
import requestAuth from "./request-auth";
import { t } from "i18next";
import { ERROR_RESPONSE } from "../../constants";

export default function handleError(
  e: unknown,
  res: VercelResponse,
  body: ReqBody
) {
  console.error(e);

  if ((e as any).httpStatusCode == 401) {
    requestAuth(res, body);
    return;
  }

  const answer: ResBody = {
    version: body.version,
    response: {
      text: t("handle_error") || ERROR_RESPONSE, // fallback in case an error occurs before or during ICU initialization
      end_session: false,
    },
  };
  end(res, answer);
}
