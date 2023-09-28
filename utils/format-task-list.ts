import { Task } from "@doist/todoist-api-typescript";
import formatTaskContent from "./format-task-content";

export default function formatTaskList(tasks: Task[]): string {
  return `${tasks
    .map((task) => formatTaskContent(task.content))
    .join("\n\n")}\n\n\n`;
}
