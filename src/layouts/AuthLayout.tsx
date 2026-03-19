import { ReactNode } from 'react';

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light p-4">
    {children}
  </div>
);

export default AuthLayout;
