import { FC, ReactElement } from 'react';
import { IToast, ToastService } from '../services/toast.service';

const Toast: FC<{ toasts: IToast[] }> = ({ toasts }): ReactElement => {
  const toastService: ToastService = new ToastService();

  const getToastClasses = (type: string) => {
    const baseClasses =
      'flex items-center justify-between p-4 rounded-lg shadow-lg cursor-pointer transform transition-all duration-200 hover:-translate-x-1';
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-500 text-white`;
      case 'error':
        return `${baseClasses} bg-red-500 text-white`;
      case 'warning':
        return `${baseClasses} bg-yellow-500 text-white`;
      case 'info':
        return `${baseClasses} bg-blue-500 text-white`;
      default:
        return baseClasses;
    }
  };

  const toastIcon = (type: string): string | null => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '!';
      case 'info':
        return 'i';
      default:
        return null;
    }
  };

  const removeToast = (id: string): void => {
    toastService.remove(id);
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast: IToast) => (
        <div key={toast.id} className={getToastClasses(toast.type)} onClick={() => removeToast(toast.id)}>
          <div className="flex items-center gap-3">
            <span className="text-white flex items-center justify-center w-6 h-6 rounded-full">
              {toastIcon(toast.type)}
            </span>
            <span className="text-sm text-white">{toast.message}</span>
          </div>
          <button
            className="ml-4 text-xl text-white opacity-60 hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
