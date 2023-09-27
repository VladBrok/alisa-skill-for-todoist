import { ReqBody, ResBody } from "alice-types";
import { VercelResponse } from "@vercel/node";
import { t } from "i18next";
import end from "./end-response";
import getApi from "./get-api";

export default async function greetKnownUser(
  res: VercelResponse,
  body: ReqBody
) {
  const api = getApi(body);
  const tasks = await api.getTasks();
  const taskCount = tasks.length;

  const answer: ResBody = {
    version: body.version,
    response: {
      text: t("greet_known_user", { count: taskCount }),
      end_session: false,
    },
  };

  end(res, answer);
}
