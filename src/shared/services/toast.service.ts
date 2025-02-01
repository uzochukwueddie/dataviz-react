import { eventBus } from "../events";
import { EventType } from "../events/types";

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface IToast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export class ToastService {
  private toasts: IToast[] = [];

  show(message: string, type: ToastType = 'info', duration: number = 3000) {
    const toast: IToast = {
      id: crypto.randomUUID(),
      message,
      type,
      duration
    };

    this.toasts.push(toast);

    eventBus.publish(EventType.TOAST_MESSAGE, this.toasts);

    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter((toast: IToast) => toast.id !== id);
    eventBus.publish(EventType.TOAST_MESSAGE, this.toasts);
  }
}
