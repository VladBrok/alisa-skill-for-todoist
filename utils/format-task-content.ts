import removeMd from "remove-markdown";

const MAX_LENGTH = 80;

export default function formatTaskContent(content: string): string {
  const contentWithoutMd = removeMd(content);
  return contentWithoutMd.length > MAX_LENGTH
    ? `${contentWithoutMd.slice(0, MAX_LENGTH)}...`
    : contentWithoutMd;
}
