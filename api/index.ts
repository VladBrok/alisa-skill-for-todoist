import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ReqBody } from "alice-types";
import i18next from 'i18next';
import ICU from "i18next-icu";

import authNotSupported from "./helpers/auth-not-supported";
import requestAuth from "./helpers/request-auth";
import handleUtterance from "./helpers/handle-utterance";
import greetKnownUser from "./helpers/greet-known-user";
import greetNewUser from "./helpers/greet-new-user";
import handleError from "./helpers/handle-error";

// TODO: добавить tts?
const translation = {
  "greet_new_user": `Добро пожаловать!
В навыке Вы можете управлять своими задачами Todoist.
Скажите "задачи", чтобы узнать список открытых задач.`,

  "handle_error": `Ой, я не смогла обработать запрос.
Пожалуйста, повторите его, или скажите "что ты умеешь" для просмотра доступных действий`,

  "auth_not_supported": `Извините, эта поверхность не поддерживает авторизацию.
Попробуйте запустить навык с телефона`,

  "greet_known_user": `{count, plural, =0{С возвращением!\nВсе задачи выполнены, так держать!\nСоздайте новую задачу, сказав, например: "Создай задачу постирать носки срок завтра} other{С возвращением!\nУ Вас {count} {count, plural, one{невыполненная} other{невыполненных}} {count, plural, one{задача} few{задачи} other{задач}}.\nСкажите "задачи", чтобы узнать, {count, plural, one{какая} few{каких} other{каких}} именно.}}`,
}


/*
`С возвращением!\nУ Вас ${taskCount} ${pluralize(taskCount, [
        "невыполненная",
        "невыполненных",
        "невыполненных",
      ])} ${pluralize(taskCount, [
        "задача",
        "задачи",
        "задач",
      ])}.\nСкажите "задачи", чтобы узнать, ${pluralize(taskCount, [
        "какая",
        "каких",
        "каких",
      ])} именно`
    : `С возвращением!\nВсе задачи выполнены, так держать!\nСоздайте новую задачу, сказав, например: "Создай задачу постирать носки срок завтра"`;
*/

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await i18next.use(ICU).init({
    debug: true,
    lng: 'ru',
    resources: {
      ru: {
        translation
      }
    }
  })

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
