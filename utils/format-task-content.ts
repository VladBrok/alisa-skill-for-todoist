const MAX_LENGTH = 80;

export default function formatTaskContent(content: string): string {
  return content.length > MAX_LENGTH
    ? `${content.slice(0, MAX_LENGTH)}...`
    : content;
}
