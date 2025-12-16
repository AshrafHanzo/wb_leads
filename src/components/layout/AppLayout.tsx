import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-56 transition-all duration-200">
        <TopBar />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
