import { FC, ReactElement } from 'react';

interface IHeader {
  onOpenModal: (type: string) => void;
}

const Header: FC<IHeader> = ({ onOpenModal }): ReactElement => {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold text-blue-600">DataViz</span>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <button
              onClick={() => onOpenModal('login')}
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Log in
            </button>
            <button
              onClick={() => onOpenModal('signup')}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign up
            </button>
          </div>
        </div>

        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <button className="w-full text-left block text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
              Log in
            </button>
            <button className="w-full text-left block text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
              Sign up
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
