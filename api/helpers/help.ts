import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";
import { VercelResponse } from "@vercel/node";
import { t } from "i18next";
import applyTts from "../../utils/apply-tts";

export default function help(res: VercelResponse, body: ReqBody) {
  const answer: ResBody = {
    version: body.version,
    response: {
      text: t("help"),
      tts: applyTts(t("help")),
      end_session: false,
    },
  };
  end(res, answer);
}
