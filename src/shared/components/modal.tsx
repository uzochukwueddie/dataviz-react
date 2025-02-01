import { FC, MouseEvent, ReactElement, ReactNode } from 'react';

interface IModal {
    children: ReactNode;
}

const ModalComponent: FC<IModal> = ({ children }): ReactElement => {
    return (
        <div className='fixed inset-0 z-50 overflow-y-auto' role='dialog' aria-modal="true">
            <div className='fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity'></div>
            <div className='flex min-h-screen items-center justify-center p-4'>
                <div
                    className='relative bg-white rounded-lg shadow-xl max-w-full mx-auto'
                    onClick={(event: MouseEvent) => event.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}

export default ModalComponent;