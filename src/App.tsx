import { FC, ReactElement, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './AppRoutes';
import { IToast } from './shared/services/toast.service';
import { eventBus } from './shared/events';
import { EventType } from './shared/events/types';
import Toast from './shared/components/toast';

const App: FC = (): ReactElement => {
  const [toasts, setToasts] = useState<IToast[]>([]);

  useEffect(() => {
    eventBus.subscribe(EventType.TOAST_MESSAGE, (payload: unknown) => {
      setToasts(payload as IToast[]);
    });

    return () => {
      eventBus.unsubscribe(EventType.TOAST_MESSAGE, () => {
        console.log('TOAST_MESSAGE event unsubscribed');
      });
    };
  }, []);

  return (
    <>
      <BrowserRouter>
        <div className="w-screen min-h-screen flex flex-col relative">
          <AppRouter />
          <Toast toasts={toasts} />
        </div>
      </BrowserRouter>
    </>
  );
};

export default App;
