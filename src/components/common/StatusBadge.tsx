import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type?: 'account' | 'lead' | 'user' | 'stage';
}

const statusStyles: Record<string, string> = {
  // Account statuses
  Active: 'bg-success/10 text-success border-success/20',
  Prospect: 'bg-primary/10 text-primary border-primary/20',
  Dormant: 'bg-muted text-muted-foreground border-muted',
  
  // User statuses
  Inactive: 'bg-muted text-muted-foreground border-muted',
  
  // Lead stages
  'New Lead': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  'Contacted': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  'Qualified': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  'Proposal': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  'Negotiation': 'bg-warning/10 text-warning border-warning/20',
  'Closed Won': 'bg-success/10 text-success border-success/20',
  'Closed Lost': 'bg-destructive/10 text-destructive border-destructive/20',
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-muted text-muted-foreground border-muted';
  
  return (
    <Badge 
      variant="outline" 
      className={cn("text-2xs font-medium border", style)}
    >
      {status}
    </Badge>
  );
}
