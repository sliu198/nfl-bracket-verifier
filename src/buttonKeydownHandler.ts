import { KeyboardEvent } from "react";

export default function buttonKeydownHandler(
  event: KeyboardEvent<HTMLElement>
) {
  if (["Enter", " "].includes(event.key)) {
    (event.target as HTMLElement).click();
  }
}
