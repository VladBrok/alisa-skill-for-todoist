import { VercelResponse } from "@vercel/node";
import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";

export default function authNotSupported(res: VercelResponse, body: ReqBody) {
  const answer: ResBody = {
    version: body.version,
    response: {
      text: "Извините, эта поверхность не поддерживает авторизацию.\nПопробуйте запустить навык с телефона",
      end_session: true, // TODO: check that it's ok
    },
  };
  end(res, answer);
}
