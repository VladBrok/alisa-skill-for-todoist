import { TodoistApi } from "@doist/todoist-api-typescript";
import dotenv from "dotenv";
dotenv.config();

const apiToken = process.env["TODOIST_TOKEN"];

if (!apiToken) {
  throw new Error("TODOIST_TOKEN was not provided");
}

const api = new TodoistApi(apiToken);

api
  .getTasks()
  .then((tasks) => console.log(tasks))
  .catch((error) => console.log(error));
