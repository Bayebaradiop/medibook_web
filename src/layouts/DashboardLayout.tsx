import { ReactNode } from 'react';
import AppSidebar from '@/components/common/AppSidebar';
import Topbar from '@/components/common/Topbar';
import PageTransition from '@/components/common/PageTransition';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => (
  <div className="flex min-h-screen w-full bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar title={title} />
      <main className="flex-1 p-4 lg:p-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  </div>
);

export default DashboardLayout;
