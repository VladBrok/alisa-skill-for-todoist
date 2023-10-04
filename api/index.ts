import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ReqBody } from "alice-types";

import authNotSupported from "../utils/api-helpers/auth-not-supported";
import requestAuth from "../utils/api-helpers/request-auth";
import handleUtterance from "../utils/api-helpers/handle-utterance";
import greetAuthorizedUser from "../utils/api-helpers/greet-authorized-user";
import greetUnauthorizedUser from "../utils/api-helpers/greet-unauthorized-user";
import handleError from "../utils/api-helpers/handle-error";
import { initICU } from "../utils/api-helpers/icu";
import { pong } from "../utils/api-helpers/pong";
import help from "../utils/api-helpers/help";

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end();
    return;
  }

  const body = req?.body as ReqBody;
  try {
    // https://yandex.ru/dev/dialogs/alice/doc/moderation.html#check-after-moderation
    const isPing = body?.request?.original_utterance?.trim() === "ping";
    if (isPing) {
      pong(res, body);
      return;
    }

    await initICU();

    const isHelp = body?.request?.nlu?.intents?.["help"];
    if (isHelp) {
      help(res, body);
      return;
    }

    const supportsAuth = Boolean(body.meta.interfaces.account_linking);
    const authenticated = Boolean(body.session.user?.access_token);

    if (
      (!supportsAuth || !authenticated) &&
      !body.request?.original_utterance
    ) {
      await greetUnauthorizedUser(res, body);
      return;
    }

    if (!supportsAuth) {
      authNotSupported(res, body);
      return;
    }

    if (!authenticated) {
      requestAuth(res, body);
      return;
    }

    if (
      // @ts-ignore
      body.account_linking_complete_event ||
      !body.request?.original_utterance
    ) {
      await greetAuthorizedUser(res, body);
      return;
    }

    await handleUtterance(res, body);
  } catch (e) {
    handleError(e, res, body);
  }
}

export default handler;
