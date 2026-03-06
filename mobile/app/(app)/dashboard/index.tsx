import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

export default function DashboardIndex() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect href="/(auth)/login" />;

  if (user.accountType === 'business') {
    return <Redirect href="/(app)/dashboard/business" />;
  }
  return <Redirect href="/(app)/dashboard/client" />;
}
