'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/api';
import { refreshAccessToken, onTokenRefreshed, onTokenRefreshFailed } from '@/lib/api/authHelper';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/api/useAuth';
import CacheDebug from "@/components/debug/CacheDebug";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isAuthenticated, token } = useAuth();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Token refresh logic
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const checkTokenExpiry = async () => {
      try {
        // Check if token is expired instead of validateToken
        const isExpired = authService.isTokenExpired(token);
        if (isExpired && !isRefreshing) {
          setIsRefreshing(true);
          await refreshAccessToken();
          setIsRefreshing(false);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        setIsRefreshing(false);
        router.push('/login');
      }
    };

    // Check token validity on mount and periodically
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, token, router, isRefreshing]);

  // Token refresh event handlers
  useEffect(() => {
    const handleTokenRefreshed = () => {
      setIsRefreshing(false);
    };

    const handleTokenRefreshFailed = () => {
      setIsRefreshing(false);
      router.push('/login');
    };

    onTokenRefreshed(handleTokenRefreshed);
    onTokenRefreshFailed(handleTokenRefreshFailed);

    return () => {
      // Cleanup listeners if needed
    };
  }, [router]);

  return (
    <ThemeProvider 
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="alldrama-theme"
      themes={['light', 'dark']}
      disableTransitionOnChange
    >
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          dedupingInterval: 10000,
          errorRetryCount: 2,
          errorRetryInterval: 5000,
        }}
      >
        <MainLayout>
          {children}
        </MainLayout>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#2a2a3b',
              color: '#fff',
              padding: '14px 18px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderLeft: '4px solid transparent',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              animation: 'slideIn 0.3s ease-out',
            },
            success: {
              style: {
                borderLeftColor: '#22c55e'
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#2a2a3b',
              },
            },
            error: {
              style: {
                borderLeftColor: '#ef4444'
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#2a2a3b',
              },
            },
            loading: {
              style: {
                borderLeftColor: '#3b82f6'
              },
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#2a2a3b',
              },
            },
          }}
        />
        <CacheDebug />
      </SWRConfig>
    </ThemeProvider>
  );
} 