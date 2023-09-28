/**
 * Replaces newline (\n) characters with TTS pauses.
 * More info on TTS: https://yandex.ru/dev/dialogs/alice/doc/speech-tuning.html
 * @param text a string with newline characters
 */
export default function applyTts(text: string) {
  return text
    .replaceAll("\n\n\n", " sil <[400]> ")
    .replaceAll("\n\n", " sil <[200]> ")
    .replaceAll("\n", " sil <[100]> ");
}
