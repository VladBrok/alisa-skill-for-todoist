import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ReqBody } from "alice-types";
import authNotSupported from "./helpers/auth-not-supported";
import requestAuth from "./helpers/request-auth";
import handleUtterance from "./helpers/handle-utterance";
import greetKnownUser from "./helpers/greet-known-user";
import greetNewUser from "./helpers/greet-new-user";
import handleError from "./helpers/handle-error";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = req.body as ReqBody;

  try {
    const supportsAuth = Boolean(body.meta.interfaces.account_linking);
    if (!supportsAuth) {
      authNotSupported(res, body);
      return;
    }

    const authenticated = Boolean(body.session.user?.access_token);
    if (!authenticated) {
      requestAuth(res, body);
      return;
    }

    // @ts-ignore
    if (body.account_linking_complete_event) {
      await greetNewUser(res, body);
      return;
    }

    if (!body.request.original_utterance) {
      await greetKnownUser(res, body);
      return;
    }

    await handleUtterance(res, body);
  } catch (e) {
    handleError(e, res, body);
  }
}
