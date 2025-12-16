import { Bell, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';

export function TopBar() {
  const { currentUser, setCurrentUser } = useAuth();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin': return 'default';
      case 'BD': return 'secondary';
      case 'Sales': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search leads, accounts..." 
            className="pl-9 h-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive text-destructive-foreground text-2xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-2xs bg-primary text-primary-foreground">
                  {currentUser ? getInitials(currentUser.full_name) : '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {currentUser?.full_name}
              </span>
              <Badge variant={getRoleBadgeVariant(currentUser?.role || '')} className="text-2xs h-5 hidden md:inline-flex">
                {currentUser?.role}
              </Badge>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{currentUser?.full_name}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Role (Demo)</DropdownMenuLabel>
            {mockUsers.filter(u => u.status === 'Active').map(user => (
              <DropdownMenuItem 
                key={user.user_id}
                onClick={() => setCurrentUser(user)}
                className="text-sm"
              >
                <span className="flex-1">{user.full_name}</span>
                <Badge variant="outline" className="text-2xs">{user.role}</Badge>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm text-destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
