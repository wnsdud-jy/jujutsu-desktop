import { openUrl } from '@tauri-apps/plugin-opener';
import { useAuthStore } from '@/lib/auth';
import { useDeepLink } from '@/hooks/useDeepLink';
import { RootLayout } from '@/components/layout/RootLayout';
import { LoginPage } from '@/components/auth/LoginPage';
import { Dashboard } from '@/components/features/dashboard/Dashboard';
import { useEffect, useState } from 'react';

function App() {
  useDeepLink(); // Initialize deep link listener
  const { token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleLogin = async () => {
    // SECURITY: Use HTTPS in production
    // CORS: Ensure backend allows tauri://localhost
    await openUrl('http://localhost:3000/auth/github');
  };

  if (!mounted) return null; // Avoid hydration mismatch if SSR (not typical for Tauri but good practice)

  return (
    <RootLayout>
      {token ? (
        <Dashboard />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </RootLayout>
  );
}

export default App;
