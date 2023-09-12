import { TodoistApi } from "@doist/todoist-api-typescript";
import { ReqBody } from "alice-types";

export default function getApi(body: ReqBody) {
  const apiToken = body.session.user?.access_token + "blabla" || "";
  const api = new TodoistApi(apiToken);
  return api;
}
