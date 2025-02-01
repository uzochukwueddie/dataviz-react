import { FC, ReactElement, useState } from 'react';
import Header from './components/header';
import Hero from './components/hero';
import Features from './components/features';
import Testimonials from './components/testimonials';
import LandingCTA from './components/landing-cta';
import LandingFooter from './components/footer';
import LoginModal from '../auth/components/login-modal';
import SignupModal from '../auth/components/signup-modal';

interface LandingType {
  showLoginModal: boolean;
  showSignupModal: boolean;
}

const Landing: FC = (): ReactElement => {
  const [modal, setModal] = useState<LandingType>({ showLoginModal: false, showSignupModal: false });

  const onOpenModal = (type: string): void => {
    if (type === 'login') {
      setModal({ showLoginModal: true, showSignupModal: false });
    } else {
      setModal({ showLoginModal: false, showSignupModal: true });
    }
  };

  return (
    <>
      {modal.showLoginModal && (
        <LoginModal onClose={() => setModal({ ...modal, showLoginModal: false })} onOpenModal={onOpenModal} />
      )}
      {modal.showSignupModal && (
        <SignupModal onClose={() => setModal({ ...modal, showSignupModal: false })} onOpenModal={onOpenModal} />
      )}
      <div className="min-h-screen flex flex-col">
        <Header onOpenModal={onOpenModal} />
        <Hero />
        <Features />
        <Testimonials />
        <LandingCTA onClick={() => onOpenModal('signup')} />
        <LandingFooter />
      </div>
    </>
  );
};

export default Landing;
