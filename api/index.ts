import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ReqBody } from "alice-types";
import i18next from "i18next";
import ICU from "i18next-icu";

import authNotSupported from "./helpers/auth-not-supported";
import requestAuth from "./helpers/request-auth";
import handleUtterance from "./helpers/handle-utterance";
import greetKnownUser from "./helpers/greet-known-user";
import greetNewUser from "./helpers/greet-new-user";
import handleError from "./helpers/handle-error";
import getApi from "./helpers/get-api";

// TODO: добавить tts?
const translation = {
  greet_new_user: `Добро пожаловать!\nВ навыке Вы можете управлять своими задачами Todoist.\nСкажите "задачи", чтобы узнать список открытых задач.`,

  handle_error: `Ой, я не смогла обработать запрос.\nПожалуйста, повторите его, или скажите "что ты умеешь" для просмотра доступных действий`,

  auth_not_supported: `Извините, эта поверхность не поддерживает авторизацию.\nПопробуйте запустить навык с телефона`,

  greet_known_user: `{count, plural, =0{С возвращением!\nВсе задачи выполнены, так держать!\nСоздайте новую задачу, сказав, например: "Создай задачу постирать носки срок завтра} other{С возвращением!\nУ Вас {count} {count, plural, one{невыполненная} other{невыполненных}} {count, plural, one{задача} few{задачи} other{задач}}.\nСкажите "задачи", чтобы узнать, {count, plural, one{какая} few{каких} other{каких}} именно.}}`,

  all_tasks_done: `Все задачи выполнены. Так держать!\nСоздайте новую задачу, сказав, например: "Создай задачу постирать носки срок завтра"`,

  unhandle_utterance: `Извините, не поняла Вас.\nСкажите "что ты умеешь" для просмотра возможных действий`,

  task_created: `Задача "{taskContent}" создана. {due, select, empty{} other{Срок: {due}}}`,

  current_page: `Страница {page} из {totalPages}.`,

  next_page: `Для перехода на следующую, скажите "дальше"`,

  prev_page: `Для перехода назад, скажите "назад"`,

  close_task: `Для закрытия задачи, скажите "закрой задачу" и её название`,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await i18next.use(ICU).init({
    debug: true,
    lng: "ru",
    resources: {
      ru: {
        translation,
      },
    },
  });

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

    // TODO: remove (it's for testing)
    const api = getApi(body);
    const tasks = await api.getTasks({
      filter: (
        body.request.nlu?.intents?.["get_tasks"]?.slots?.["when"]?.value || ""
      ).toString(),
    });
    console.log("tasks:", tasks);

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
