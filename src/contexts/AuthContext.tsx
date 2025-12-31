import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType, UserRole } from '@/types';
import { mockUsers } from '@/lib/mockData';
import { api } from '@/lib/api';

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

// Removed local AuthContextType definition as it is now imported



export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage if available
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wb_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (credentials: any) => {
    try {
      const response = await api.login(credentials);
      if (response.success && response.user) {
        setCurrentUser(response.user);
        localStorage.setItem('wb_user', JSON.stringify(response.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('wb_user');
  };

  const hasPermission = (action: string, resource: string): boolean => {
    if (!currentUser) return false;

    // Normalize user role to match permission keys (handle case sensitivity)
    const userRole = (currentUser.role || 'Intern') as UserRole;

    // Fallback to Intern permissions if role not found
    const rolePermissions = permissions[userRole] || permissions['Intern'];

    // Check if permission exists for the resource
    const resourcePermissions = rolePermissions[resource];
    return resourcePermissions?.includes(action) || false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, hasPermission, login, logout }}>
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
