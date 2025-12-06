// app/(authenticated)/layout.tsx (Server Component)

import { ThemeProvider } from './components/ThemeContext';
import AuthenticatedThemeWrapper from './components/AuthenticatedThemeWrapper';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthenticatedThemeWrapper>
        <div className="flex min-h-screen"> 
          {children}
        </div>
      </AuthenticatedThemeWrapper>
    </ThemeProvider>
  );
}