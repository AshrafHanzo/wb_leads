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
  Headphones,
  Presentation,
  Lightbulb,
  FlaskConical,
  FileSignature,
  Rocket,
  FileCheck,
  PenLine,
  Building2,
  Calendar
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
  allowedRoles?: string[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', resource: 'leads', allowedRoles: ['Admin', 'BD', 'Telecaller', 'Sales'] },
  { path: '/accounts', icon: Building2, label: 'Accounts', resource: 'leads', allowedRoles: ['Admin', 'BD', 'Sales'] },
  {
    icon: Search,
    label: 'Lead Sourcing',
    resource: 'leads',
    allowedRoles: ['Admin', 'BD'],
    children: [
      { path: '/sourcing', icon: Search, label: 'New Lead', resource: 'leads' },
      { path: '/data-enrichment', icon: Database, label: 'Data Enrichment', resource: 'leads' },
      { path: '/product-qualification', icon: CheckSquare, label: 'Product Qualification', resource: 'leads' },
    ]
  },
  {
    icon: Phone,
    label: 'Lead Outreach',
    resource: 'leads',
    allowedRoles: ['Admin', 'Telecaller'],
    children: [
      { path: '/telecalling', icon: Headphones, label: 'Telecalling', resource: 'leads' },
      { path: '/initial-connect', icon: Phone, label: 'Initial Connect', resource: 'leads' },
      { path: '/demo', icon: Presentation, label: 'Demo', resource: 'leads' },
    ]
  },
  {
    icon: Lightbulb,
    label: 'Lead Discovery',
    resource: 'leads',
    allowedRoles: ['Admin', 'Telecaller'],
    children: [
      { path: '/discovery', icon: Lightbulb, label: 'Discovery', resource: 'leads' },
      { path: '/poc', icon: FlaskConical, label: 'POC', resource: 'leads' },
    ]
  },
  {
    icon: FileSignature,
    label: 'Lead Proposal',
    resource: 'leads',
    allowedRoles: ['Admin', 'Sales'],
    children: [
      { path: '/proposal-commercials', icon: FileSignature, label: 'Proposal & Commercials', resource: 'leads' },
      { path: '/pilot', icon: Rocket, label: 'Pilot', resource: 'leads' },
    ]
  },
  { path: '/closed-won', icon: FileCheck, label: 'Closed Won', resource: 'leads', allowedRoles: ['Admin', 'Sales'] },
  { path: '/closed-lost', icon: PenLine, label: 'Closed Lost', resource: 'leads', allowedRoles: ['Admin', 'Sales'] },
  { path: '/meetings', icon: Calendar, label: 'Meetings', resource: 'leads', allowedRoles: ['Admin', 'BD', 'Sales', 'Telecaller'] },
  { path: '/reports', icon: FileText, label: 'Reports', resource: 'leads', allowedRoles: ['Admin'] },
  { path: '/settings', icon: Settings, label: 'Settings', resource: 'settings', allowedRoles: ['Admin'] },
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
    // If item has specific roles defined, check if user has one of them
    if (item.allowedRoles && currentUser) {
      // Admin always has access (override)
      if (currentUser.role === 'Admin') return true;

      // Check if user's role is in allowedRoles
      return item.allowedRoles.includes(currentUser.role);
    }

    // Fallback to permission-based check if no roles defined
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
        {/* <Zap className="h-6 w-6 text-sidebar-primary shrink-0" /> */}
        <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain shrink-0" />
        {!collapsed && (
          <span className="ml-2 font-semibold text-sidebar-foreground text-sm">
            WorkBoosterAI
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
