import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './components/AuthProvider';
import { QueryProvider } from './components/QueryProvider';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'WeSport - Social Network for Athletes',
  description: 'Share your sports moments and connect with athletes',
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WeSport',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-black text-white">
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              {children}
              <ToastProvider />
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

