"use client";

import { PaginationData } from "@/types/approval";

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, pages, total } = pagination;

  // Genereer een array van paginanummers om weer te geven
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (pages <= maxPagesToShow) {
      // Als er minder pagina's zijn dan het maximum, toon ze allemaal
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Anders toon een subset met de huidige pagina in het midden
      let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(pages, startPage + maxPagesToShow - 1);
      
      // Pas aan als we aan het einde zijn
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Voeg ellipsis toe indien nodig
      if (startPage > 1) {
        pageNumbers.unshift(1);
        if (startPage > 2) pageNumbers.splice(1, 0, -1); // -1 representeert ellipsis
      }
      
      if (endPage < pages) {
        if (endPage < pages - 1) pageNumbers.push(-1);
        pageNumbers.push(pages);
      }
    }
    
    return pageNumbers;
  };

  if (pages <= 1) return null;

  return (
    <div className="backdrop-blur-sm bg-white/50 dark:bg-white/5 px-4 py-3 flex items-center justify-between border-t border-white/20 dark:border-purple-500/20 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Toont <span className="font-medium">{(page - 1) * pagination.limit + 1}</span> tot{" "}
            <span className="font-medium">
              {Math.min(page * pagination.limit, total)}
            </span>{" "}
            van <span className="font-medium">{total}</span> resultaten
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-lg border backdrop-blur-sm text-sm font-medium min-h-[44px] transition-colors ${
                page === 1
                  ? "border-gray-200 dark:border-purple-500/20 bg-white/30 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "border-gray-200 dark:border-purple-500/30 bg-white/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-white/10"
              }`}
            >
              <span className="sr-only">Vorige</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {getPageNumbers().map((pageNumber, index) => (
              pageNumber === -1 ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-200 dark:border-purple-500/20 backdrop-blur-sm bg-white/30 dark:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium min-h-[44px] transition-colors ${
                    page === pageNumber
                      ? "z-10 backdrop-blur-sm bg-purple-500/20 dark:bg-purple-500/20 border-purple-500/50 text-purple-600 dark:text-purple-400"
                      : "backdrop-blur-sm bg-white/50 dark:bg-white/5 border-gray-200 dark:border-purple-500/20 text-gray-500 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-white/10"
                  }`}
                >
                  {pageNumber}
                </button>
              )
            ))}

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === pages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-lg border backdrop-blur-sm text-sm font-medium min-h-[44px] transition-colors ${
                page === pages
                  ? "border-gray-200 dark:border-purple-500/20 bg-white/30 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "border-gray-200 dark:border-purple-500/30 bg-white/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-white/10"
              }`}
            >
              <span className="sr-only">Volgende</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
