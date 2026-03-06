import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiGetNotifications, apiMarkNotificationRead } from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const data = await apiGetNotifications();
    setNotifications(data);
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [user, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const markRead = async (id: string) => {
    await apiMarkNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
  };

  if (loading) return <LoadingScreen />;

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          notifications.map((n) => (
            <View key={n.id} style={[styles.notifCard, !n.readAt && styles.notifCardUnread]}>
              {!n.readAt && <View style={styles.unreadDot} />}
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifBody}>{n.body}</Text>
                <Text style={styles.notifTime}>
                  {new Date(n.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Text>
              </View>
              {!n.readAt && (
                <TouchableOpacity onPress={() => markRead(n.id)} style={styles.markReadBtn}>
                  <Text style={styles.markReadText}>Mark read</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  badge: {
    backgroundColor: '#10b981',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notifCardUnread: { borderColor: '#a7f3d0', backgroundColor: '#f0fdf4' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginTop: 5,
    marginRight: 10,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 3 },
  notifBody: { fontSize: 13, color: '#4b5563', lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11, color: '#9ca3af' },
  markReadBtn: { paddingLeft: 8 },
  markReadText: { fontSize: 12, color: '#10b981', fontWeight: '600' },
});
