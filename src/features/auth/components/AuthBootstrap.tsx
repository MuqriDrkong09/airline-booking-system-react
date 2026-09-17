import { useEffect, type ReactNode } from 'react';
import { PageLoader } from '@/components/common/PageLoader';
import { useAuthStore } from '../store/authStore';

interface AuthBootstrapProps {
  children: ReactNode;
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  useEffect(() => {
    void useAuthStore.getState().bootstrap();
  }, []);

  if (isBootstrapping) {
    return <PageLoader fullPage label="Restoring your session" />;
  }

  return children;
}
