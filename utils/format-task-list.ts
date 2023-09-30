import { Task } from "@doist/todoist-api-typescript";
import formatTaskContent from "./format-task-content";

export default function formatTaskList(tasks: Task[], limit?: number): string {
  const resultTasks = limit == null ? tasks : tasks.slice(0, limit);
  return `${resultTasks
    .map((task) => formatTaskContent(task.content))
    .join("\n\n")}\n\n\n`;
}
