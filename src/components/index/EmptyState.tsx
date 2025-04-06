
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  hasSearchQuery: boolean;
  onCreateTransaction: () => void;
}

const EmptyState = ({ hasSearchQuery, onCreateTransaction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      {hasSearchQuery ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 className="text-lg font-medium mb-2">No Results Found</h3>
          <p className="text-muted-foreground mb-4">
            No transactions match your search criteria
          </p>
          <Button
            onClick={onCreateTransaction}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Transaction
          </Button>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
          <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first transaction to get started
          </p>
        </>
      )}
    </div>
  );
};

export default EmptyState;
