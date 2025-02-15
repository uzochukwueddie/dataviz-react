import { ChangeEvent, FC, FormEvent, ReactElement, useState } from 'react';
import ModalComponent from '../../../shared/components/modal';
import { useAppDispatch } from '../../../store';
import { useNavigate } from 'react-router-dom';
import { FetchResult, useMutation } from '@apollo/client';
import { LOGIN_USER } from '../graphql/auth';
import { addAuthUser } from '../reducers/auth.reducer';
import { getLocalStorageItem, setLocalStorageItem } from '../../../shared/utils/utils';
import { ToastService } from '../../../shared/services/toast.service';
import { addDataSource } from '../../datasources/reducers/datasource.reducer';

interface IAuthPayload {
  email: string;
  password: string;
}

const LoginModal: FC<{ onClose: () => void; onOpenModal: (type: string) => void }> = ({
  onClose,
  onOpenModal
}): ReactElement => {
  const [userInfo, setUserInfo] = useState<IAuthPayload>({ email: '', password: '' });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toastService: ToastService = new ToastService();
  const [loginUser, { loading }] = useMutation(LOGIN_USER);

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      const result: FetchResult = await loginUser({
        fetchPolicy: 'no-cache',
        variables: {
          email: userInfo.email,
          password: userInfo.password
        }
      });
      if (result && result.data) {
        const { loginUser } = result.data;
        const { user, projectIds } = loginUser;
        dispatch(addAuthUser({ authInfo: user }));
        const activeProject = getLocalStorageItem('activeProject');
        if (!activeProject || (activeProject === 'undefined' && projectIds.length > 0)) {
          setLocalStorageItem('activeProject', JSON.stringify(projectIds[0]));
        }
        if (activeProject !== 'undefined' && activeProject !== null) {
          dispatch(
            addDataSource({
              active: activeProject ? activeProject : projectIds[0],
              database: activeProject ? activeProject.database : projectIds[0].database,
              dataSource: projectIds
            })
          );
        }
        navigate('/dashboard');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toastService.show(error?.message || 'Invalid credentials', 'error');
    }
  };

  return (
    <ModalComponent>
      <div className="w-full md:w-[400px] md:max-w-2xl">
        <div className="flex justify-between items-center p-4 border-gray-200 border-b-1">
          <h2 className="text-xl font-semibold">Log in to your account</h2>
          <button
            onClick={onClose}
            className="text-gray-500 cursor-pointer hover:text-gray-700"
            aria-label="Close modal"
          >
            <i className="fa fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="off"
                className="mt-1 block w-full rounded-sm border-gray-400 shadow-xs focus:outline-none"
                value={userInfo.email}
                onChange={(event: ChangeEvent) => {
                  setUserInfo({ ...userInfo, email: (event.target as HTMLInputElement).value });
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="off"
                className="mt-1 block w-full rounded-xs border-gray-400 shadow-xs focus:outline-none"
                value={userInfo.password}
                onChange={(event: ChangeEvent) => {
                  setUserInfo({ ...userInfo, password: (event.target as HTMLInputElement).value });
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {`${loading ? 'LOGIN IN PROGRESS' : 'LOGIN'}`}
            </button>
          </div>
        </form>

        <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500 text-center rounded-b-lg">
          Don't have an account?
          <button
            onClick={() => onOpenModal('signup')}
            className="font-medium cursor-pointer text-blue-600 hover:text-blue-500 ml-1"
          >
            Sign up
          </button>
        </div>
      </div>
    </ModalComponent>
  );
};

export default LoginModal;
