import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Zap,
  FileText,
  Search,
  Database,
  CheckSquare,
  Phone,
  Presentation,
  Lightbulb,
  FlaskConical,
  FileSignature,
  Rocket,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface NavItem {
  path?: string;
  icon: any;
  label: string;
  resource?: string;
  adminOnly?: boolean;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', resource: 'leads' },
  {
    icon: Search,
    label: 'Lead Sourcing',
    resource: 'leads',
    children: [
      { path: '/sourcing', icon: Search, label: 'Sourcing', resource: 'leads' },
      { path: '/data-enrichment', icon: Database, label: 'Data Enrichment', resource: 'leads' },
      { path: '/product-qualification', icon: CheckSquare, label: 'Product Qualification', resource: 'leads' },
    ]
  },
  {
    icon: Phone,
    label: 'Lead Outreach',
    resource: 'leads',
    children: [
      { path: '/initial-connect', icon: Phone, label: 'Initial Connect', resource: 'leads' },
      { path: '/demo', icon: Presentation, label: 'Demo', resource: 'leads' },
    ]
  },
  {
    icon: Lightbulb,
    label: 'Lead Discovery',
    resource: 'leads',
    children: [
      { path: '/discovery', icon: Lightbulb, label: 'Discovery', resource: 'leads' },
      { path: '/poc', icon: FlaskConical, label: 'POC', resource: 'leads' },
    ]
  },
  {
    icon: FileSignature,
    label: 'Lead Proposal',
    resource: 'leads',
    children: [
      { path: '/proposal-commercials', icon: FileSignature, label: 'Proposal & Commercials', resource: 'leads' },
      { path: '/pilot', icon: Rocket, label: 'Pilot', resource: 'leads' },
      { path: '/contract', icon: FileCheck, label: 'Contract', resource: 'leads' },
    ]
  },
  { path: '/reports', icon: FileText, label: 'Reports', resource: 'leads' },
  { path: '/settings', icon: Settings, label: 'Settings', resource: 'settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { currentUser, hasPermission, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Initialize expanded sections based on current path
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const activeItem = navItems.find(item =>
      item.children?.some(child => child.path === location.pathname)
    );
    return activeItem ? [activeItem.label] : [];
  });

  // Keep section expanded when navigating
  useEffect(() => {
    const activeItem = navItems.find(item =>
      item.children?.some(child => child.path === location.pathname)
    );
    if (activeItem) {
      setExpandedSections(prev =>
        prev.includes(activeItem.label) ? prev : [...prev, activeItem.label]
      );
    }
  }, [location.pathname]);

  const toggleSection = (label: string) => {
    setExpandedSections(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const visibleItems = navItems.filter(item => {
    if (item.adminOnly && currentUser?.role !== 'Admin') return false;
    return hasPermission('view', item.resource || 'leads');
  });

  const renderNavItem = (item: NavItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.label);
    const isActive = item.path && location.pathname === item.path;

    if (hasChildren) {
      return (
        <li key={item.label}>
          <button
            onClick={() => toggleSection(item.label)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3 shrink-0" />
                ) : (
                  <ChevronDown className="h-3 w-3 shrink-0" />
                )}
              </>
            )}
          </button>
          {!collapsed && isExpanded && (
            <ul className="mt-1 space-y-1">
              {item.children?.map(child => renderNavItem(child, true))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.path}>
        <Link
          to={item.path!}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            isChild && "ml-6",
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
  };

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
          {visibleItems.map(item => renderNavItem(item))}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="p-2 border-t border-sidebar-border space-y-2">
        {!collapsed && currentUser && (
          <div className="px-2 py-1 text-xs text-muted-foreground truncate">
            {currentUser.email}
          </div>
        )}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="flex-1 justify-center text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex-1 justify-center text-sidebar-foreground hover:bg-sidebar-accent text-red-500 hover:text-red-600"
            title="Logout"
          >
            <span className="text-xs font-bold">Logout</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
