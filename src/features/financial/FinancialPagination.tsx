import * as React from 'react';
import { Button } from '@/features/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/cn';

interface FinancialPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const FinancialPagination: React.FC<FinancialPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const pages: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/40 text-xs">
      <div className="text-muted-foreground">
        Página <span className="font-semibold text-foreground">{currentPage}</span> de{' '}
        <span className="font-semibold text-foreground">{totalPages}</span>{' '}
        <span className="text-muted-foreground/80">
          (mostrando {startItem}–{endItem} de {totalItems} cobranças)
        </span>
      </div>

      <div className="flex items-center gap-1 self-center sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          <span>Anterior</span>
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {pages.map((p, index) => {
            if (p === '...') {
              return (
                <span key={`dots-${index}`} className="px-2 text-muted-foreground select-none">
                  ...
                </span>
              );
            }
            const pageNum = p as number;
            const isCurrent = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'h-8 w-8 rounded-lg text-xs font-medium transition-all select-none',
                  isCurrent
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <span>Próximo</span>
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
