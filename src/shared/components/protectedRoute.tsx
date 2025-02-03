import { useMutation, useQuery } from '@apollo/client';
import { FC, ReactElement, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { CHECK_CURRENT_USER, LOGOUT_USER } from '../../features/auth/graphql/auth';
import { deleteLocalStorageItem, getLocalStorageItem, setLocalStorageItem } from '../utils/utils';
import { addAuthUser } from '../../features/auth/reducers/auth.reducer';
import { addDataSource } from '../../features/datasources/reducers/datasource.reducer';

interface IProtectRouteProps {
  children: ReactNode;
}

type NavigateProps = { to: string; type: string };

function Navigate({ to, type }: NavigateProps): null {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logout, { client }] = useMutation(LOGOUT_USER);

  useEffect(() => {
    if (type === 'logout') {
      logout().then(async () => {
        deleteLocalStorageItem('activeProject');
        client.clearStore();
      });
    }
    navigate(to);
  }, [type, to, dispatch, client, logout, navigate]);

  return null;
}

const ProtectedRoute: FC<IProtectRouteProps> = ({ children }): ReactElement => {
  const dispatch = useAppDispatch();
  const { loading, error, data } = useQuery(CHECK_CURRENT_USER, {
    fetchPolicy: 'no-cache'
  });

  useEffect(() => {
    if (data) {
      const { checkCurrentUser } = data;
      const { user, projectIds } = checkCurrentUser;
      dispatch(addAuthUser({ authInfo: user }));
      const activeProject = getLocalStorageItem('activeProject');
      setLocalStorageItem(
        'activeProject',
        activeProject !== 'undefined' && activeProject !== null
          ? JSON.stringify(activeProject)
          : JSON.stringify(projectIds[0])
      );
      dispatch(
        addDataSource({
          active:
            activeProject !== 'undefined' && activeProject !== null
              ? activeProject
              : projectIds.length > 0
              ? projectIds[0]
              : null,
          dataSource: projectIds,
          database:
            activeProject !== 'undefined' && activeProject !== null
              ? activeProject.database
              : projectIds.length > 0
              ? projectIds[0].database
              : ''
        })
      );
      // TODO: Dispatch collections
    }
  }, [data, dispatch, loading]);

  if (loading) {
    return (
      <div className="bg-white/[0.8] flex justify-center items-center z-50 left-0 top-0 absolute h-full w-full">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
      </div>
    );
  } else {
    if (!error && data && data.checkCurrentUser.user) {
      return <>{children}</>;
    } else {
      return (
        <>
          <Navigate to="/" type="logout" />
        </>
      );
    }
  }
};

export default ProtectedRoute;
