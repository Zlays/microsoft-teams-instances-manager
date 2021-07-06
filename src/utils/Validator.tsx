const regex = new RegExp('[^a-zA-Z0-9 ]');
export default function inputValidator(text): string {
  return text.replace(regex, '');
}
