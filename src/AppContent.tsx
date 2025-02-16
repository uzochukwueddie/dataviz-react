import { FC, ReactElement, useEffect, useState } from 'react';
import AppRouter from './AppRoutes';
import Toast from './shared/components/toast';
import { IToast } from './shared/services/toast.service';
import { eventBus } from './shared/events';
import { EventType } from './shared/events/types';
import { useLocation } from 'react-router-dom';
import Sidebar from './shared/components/sidebar';
import { useAppSelector } from './store';
import { IReduxState } from './store/store.interface';
import IconSidebar from './shared/components/icon-sidebar';
import { deleteLocalStorageItem } from './shared/utils/utils';

interface ISidebarItem {
  activeUrl: string;
  isActive: boolean;
}

const AppContent: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const [toasts, setToasts] = useState<IToast[]>([]);
  const [sidebarItem, setSidebarItem] = useState<ISidebarItem>({ activeUrl: '', isActive: false });
  const location = useLocation();
  const pathname = location.pathname;
  const hasUserData = Object.keys(authUser).length > 0;

  useEffect(() => {
    setSidebarItem({
      activeUrl: pathname,
      isActive: pathname.includes('/charts/create') || pathname.includes('/charts/edit')
    });
    eventBus.subscribe(EventType.TOAST_MESSAGE, (payload: unknown) => {
      setToasts(payload as IToast[]);
    });

    return () => {
      eventBus.unsubscribe(EventType.TOAST_MESSAGE, () => {
        console.log('TOAST_MESSAGE event unsubscribed');
      });
    };
  }, [pathname]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      deleteLocalStorageItem('activeProject');
    };

    const handleUnload = () => {
      deleteLocalStorageItem('activeProject');
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  return (
    <div className="w-screem min-h-screen flex relative overflow-hidden">
      {hasUserData && !sidebarItem.isActive && sidebarItem.activeUrl !== '/' && <Sidebar />}
      {hasUserData && sidebarItem.isActive && sidebarItem.activeUrl !== '/' && <IconSidebar />}
      <div className="w-full">
        <AppRouter />
        <Toast toasts={toasts} />
      </div>
    </div>
  );
};

export default AppContent;
