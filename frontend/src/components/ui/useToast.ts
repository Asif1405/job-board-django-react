import { useEffect, useState } from "react";
import type { ToastProps, ToastActionElement } from "./Toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 4000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type Toast = Omit<ToasterToast, "id">;

const listeners: Array<(state: ToasterToast[]) => void> = [];
let memoryState: ToasterToast[] = [];

function dispatch(toasts: ToasterToast[]) {
  memoryState = toasts;
  listeners.forEach((l) => l(toasts));
}

export function toast(props: Toast) {
  const id = genId();
  const dismiss = () =>
    dispatch(memoryState.filter((t) => t.id !== id));

  dispatch([
    { ...props, id, open: true, onOpenChange: (open: boolean) => { if (!open) dismiss(); } },
    ...memoryState,
  ].slice(0, TOAST_LIMIT));

  setTimeout(dismiss, TOAST_REMOVE_DELAY);
  return { id, dismiss };
}

export function useToast() {
  const [toasts, setToasts] = useState<ToasterToast[]>(memoryState);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return { toasts, toast };
}
