import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxDisplayedPages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxDisplayedPages = 5
}: PaginationProps) {
  // If we have fewer pages than the max display amount, show all pages
  if (totalPages <= maxDisplayedPages) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  // If we have more pages than the max display amount, show a subset with ellipses
  const siblingCount = Math.floor((maxDisplayedPages - 3) / 2); // 3 accounts for first, last, and current page
  
  let startPage = Math.max(1, currentPage - siblingCount);
  let endPage = Math.min(totalPages, currentPage + siblingCount);
  
  // Adjust if we're at the start or end
  if (currentPage <= siblingCount + 1) {
    endPage = Math.min(totalPages, maxDisplayedPages - 1);
  } else if (currentPage >= totalPages - siblingCount) {
    startPage = Math.max(1, totalPages - maxDisplayedPages + 2);
  }
  
  const pages = [];
  
  // Add first page
  pages.push(
    <Button
      key={1}
      variant={currentPage === 1 ? "default" : "outline"}
      size="icon"
      onClick={() => onPageChange(1)}
    >
      1
    </Button>
  );
  
  // Add ellipsis if needed
  if (startPage > 2) {
    pages.push(
      <Button
        key="start-ellipsis"
        variant="outline"
        size="icon"
        disabled
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    );
  }
  
  // Add middle pages
  for (let i = Math.max(2, startPage); i <= Math.min(endPage, totalPages - 1); i++) {
    pages.push(
      <Button
        key={i}
        variant={currentPage === i ? "default" : "outline"}
        size="icon"
        onClick={() => onPageChange(i)}
      >
        {i}
      </Button>
    );
  }
  
  // Add ellipsis if needed
  if (endPage < totalPages - 1) {
    pages.push(
      <Button
        key="end-ellipsis"
        variant="outline"
        size="icon"
        disabled
  >
    <MoreHorizontal className="h-4 w-4" />
      </Button>
    );
  }
  
  // Add last page if we have more than one page
  if (totalPages > 1) {
    pages.push(
      <Button
        key={totalPages}
        variant={currentPage === totalPages ? "default" : "outline"}
        size="icon"
        onClick={() => onPageChange(totalPages)}
      >
        {totalPages}
      </Button>
    );
  }
  
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pages}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
