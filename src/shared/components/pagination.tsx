import { FC, ReactElement } from 'react';

interface IPagination {
  currentPage: number;
  totalPages: number;
  onPaginationData: (newPage: number) => void;
}

const Pagination: FC<IPagination> = ({ currentPage, totalPages, onPaginationData }): ReactElement => {
  const nextPage = (): void => {
    if (currentPage < totalPages) {
      onPaginationData(currentPage + 1);
    }
  };

  const previousPage = (): void => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1) {
      onPaginationData(prevPage);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between px-4 gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={previousPage}
            disabled={currentPage === 1}
            className="px-4 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa fa-arrow-left"></i>
          </button>

          <span className="px-4 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md flex w-[100px] justify-center">
            {currentPage} of {totalPages}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa fa-arrow-right "></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
