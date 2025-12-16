import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType, UserRole } from '@/types';
import { mockUsers } from '@/lib/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Permission matrix
const permissions: Record<UserRole, Record<string, string[]>> = {
  Admin: {
    leads: ['view', 'create', 'edit', 'delete', 'assign', 'export'],
    accounts: ['view', 'create', 'edit', 'delete', 'export'],
    users: ['view', 'create', 'edit', 'delete'],
    stages: ['view', 'create', 'edit', 'delete'],
    settings: ['view', 'edit'],
  },
  BD: {
    leads: ['view', 'create', 'edit', 'assign', 'export'],
    accounts: ['view', 'create', 'edit', 'export'],
    users: ['view'],
    stages: ['view'],
    settings: ['view'],
  },
  Sales: {
    leads: ['view', 'edit', 'export'],
    accounts: ['view', 'export'],
    users: ['view'],
    stages: ['view'],
    settings: ['view'],
  },
  Telecaller: {
    leads: ['view', 'edit', 'export'],
    accounts: ['view'],
    users: ['view'],
    stages: ['view'],
    settings: ['view'],
  },
  Intern: {
    leads: ['view'],
    accounts: ['view'],
    users: [],
    stages: ['view'],
    settings: [],
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default to Admin user for demo
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]);

  const hasPermission = (action: string, resource: string): boolean => {
    if (!currentUser) return false;
    const rolePermissions = permissions[currentUser.role];
    const resourcePermissions = rolePermissions[resource];
    return resourcePermissions?.includes(action) || false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
