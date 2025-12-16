import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Target, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Layers,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', resource: 'leads' },
  { path: '/leads', icon: Target, label: 'Leads', resource: 'leads' },
  { path: '/accounts', icon: Building2, label: 'Accounts', resource: 'accounts' },
  { path: '/users', icon: Users, label: 'Users', resource: 'users', adminOnly: true },
  { path: '/stages', icon: Layers, label: 'Stages', resource: 'stages', adminOnly: true },
  { path: '/settings', icon: Settings, label: 'Settings', resource: 'settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { currentUser, hasPermission } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter(item => {
    if (item.adminOnly && currentUser?.role !== 'Admin') return false;
    return hasPermission('view', item.resource);
  });

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 z-40",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <Zap className="h-6 w-6 text-sidebar-primary shrink-0" />
        {!collapsed && (
          <span className="ml-2 font-semibold text-sidebar-foreground text-sm">
            WorkBooster
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1 px-2">
          {visibleItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
