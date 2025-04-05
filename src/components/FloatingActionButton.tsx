
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingActionButtonProps {
  options: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          align="end" 
          alignOffset={-20}
          className="p-2 w-auto min-w-[200px]"
        >
          <div className="flex flex-col gap-2">
            {options.map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                onClick={() => {
                  option.onClick();
                  setIsOpen(false);
                }}
                className="justify-start font-normal py-2"
              >
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {option.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FloatingActionButton;
