export interface ToastElement {
  textContent: string | null;
  hidden: boolean;
}

/** Keep a newly displayed toast visible for its full duration. */
export function createToastPresenter(element: ToastElement, durationMs = 1800) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (message: string): void => {
    if (timer !== undefined) clearTimeout(timer);
    element.textContent = message;
    element.hidden = false;
    timer = setTimeout(() => {
      element.hidden = true;
      timer = undefined;
    }, durationMs);
  };
}
