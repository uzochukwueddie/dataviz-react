import { FC, ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppContent from './AppContent';

const App: FC = (): ReactElement => {
  return (
    <>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </>
  );
};

export default App;
