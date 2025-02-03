import clsx from 'clsx';
import { Menu } from 'lucide-react';
import { FC, ReactElement, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { useMutation } from '@apollo/client';
import { LOGOUT_USER } from '../../features/auth/graphql/auth';
import { deleteLocalStorageItem } from '../utils/utils';
import { updateLogout } from '../../features/auth/reducers/logout.reducer';

const Sidebar: FC = (): ReactElement => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useMutation(LOGOUT_USER);

  const toggelCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const logoutUser = async (): Promise<void> => {
    try {
      await logout();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      deleteLocalStorageItem('activeProject');
    } finally {
      dispatch(updateLogout({}));
      deleteLocalStorageItem('activeProject');
      navigate('/');
    }
  };

  const isLinkActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <aside
      className={clsx('h-screen bg-gray-800 text-white flex-shrink-0 transition-all duration-300 ease-in-out', {
        'w-64': !isCollapsed,
        'w-16': isCollapsed
      })}
    >
      <div className="p-4 flex justify-between items-center">
        <h2
          className={clsx('text-xl font-bold transition-all duration-300', {
            'opacity-0 w-0': isCollapsed,
            'opacity-100': !isCollapsed
          })}
        >
          DataViz
        </h2>
        <button
          onClick={toggelCollapse}
          className={clsx('p-2 hover:bg-gray-700 rounded transition-transform duration-300', {
            'rotate-180': isCollapsed
          })}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      <nav className="mt-4">
        <Link
          to="/dashboard"
          className={clsx('flex gap-3 items-center p-4 hover:bg-gray-700 transition-all duration-300', {
            'bg-gray-700 hover:bg-gray-600': isLinkActive('/dashboard'),
            'hover:bg-gray-700': !isLinkActive('/dashboard')
          })}
        >
          <i className="fas fa-home text-xl"></i>
          <span
            className={clsx('transition-all duration-300', {
              'opacity-0 w-0': isCollapsed,
              'opacity-100': !isCollapsed
            })}
          >
            Dashboard
          </span>
        </Link>
        <Link
          to="/charts"
          className={clsx('flex gap-3 items-center p-4 hover:bg-gray-700 transition-all duration-300', {
            'bg-gray-700 hover:bg-gray-600': isLinkActive('/charts'),
            'hover:bg-gray-700': !isLinkActive('/charts')
          })}
        >
          <i className="fa-regular fa-chart-bar text-xl"></i>
          <span
            className={clsx('transition-all duration-300', {
              'opacity-0 w-0': isCollapsed,
              'opacity-100': !isCollapsed
            })}
          >
            Charts
          </span>
        </Link>
        <Link
          to="/datasources"
          className={clsx('flex gap-3 items-center p-4 hover:bg-gray-700 transition-all duration-300', {
            'bg-gray-700 hover:bg-gray-600': isLinkActive('/datasources'),
            'hover:bg-gray-700': !isLinkActive('/datasources')
          })}
        >
          <i className="fas fa-database text-xl"></i>
          <span
            className={clsx('transition-all duration-300', {
              'opacity-0 w-0': isCollapsed,
              'opacity-100': !isCollapsed
            })}
          >
            Data Sources
          </span>
        </Link>
        <div className="flex-grow"></div>
        <button
          className={clsx(
            'flex gap-3 cursor-pointer items-center p-4 hover:bg-gray-700 transition-all duration-300 absolute bottom-0',
            {
              'w-16': isCollapsed,
              'w-64': !isCollapsed
            }
          )}
          onClick={logoutUser}
        >
          <i className="fa-solid fa-right-from-bracket text-xl"></i>
          <span
            className={clsx('transition-all duration-300', {
              'opacity-0 w-0': isCollapsed,
              'opacity-100': !isCollapsed
            })}
          >
            Logout
          </span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
