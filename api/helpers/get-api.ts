import { TodoistApi } from "@doist/todoist-api-typescript";
import { ReqBody } from "alice-types";

export default function getApi(body: ReqBody) {
  const apiToken = body.session.user?.access_token || "";
  const api = new TodoistApi(apiToken); // TODO: make it a singleton ??
  return api;
}
