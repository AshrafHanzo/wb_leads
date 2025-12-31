import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CompactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function CompactModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
}: CompactModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("p-0 gap-0 overflow-hidden flex flex-col", sizeClasses[size], "max-h-[min(90vh,800px)]")}>
        <DialogHeader className="px-4 py-3 border-b bg-muted/30 shrink-0">
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-xs">{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="p-4 overflow-y-auto flex-1">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
