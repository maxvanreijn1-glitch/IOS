import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiAcceptBooking, apiCancelBooking, apiGetBookings } from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';

interface Booking {
  id: string;
  reason: string;
  startTime: string;
  endTime: string;
  status: string;
  clientId?: string;
  memberId?: string;
  client: { id: string; name: string | null; email: string };
  member: { id: string; name: string | null; email: string };
  organisation?: { id: string; name: string };
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#fef9c3', text: '#854d0e' },
  CONFIRMED: { bg: '#dcfce7', text: '#166534' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
  RESCHEDULED: { bg: '#dbeafe', text: '#1e40af' },
};

export default function MeetingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isBusinessOwner =
    user?.accountType === 'business' && (user?.ownedOrganisations?.length ?? 0) > 0;
  const isClient = user?.accountType === 'client';

  // Determine orgs to fetch bookings from
  const orgIds: string[] = isBusinessOwner
    ? (user?.ownedOrganisations ?? []).map((o) => o.id)
    : (user?.memberships ?? []).map((m) => m.organisationId);

  const loadData = useCallback(async () => {
    if (orgIds.length === 0) {
      setBookings([]);
      return;
    }
    const results = await Promise.all(orgIds.map((id) => apiGetBookings(id)));
    const all = results.flat() as Booking[];
    // Deduplicate and sort by startTime
    const seen = new Set<string>();
    const unique = all.filter((b) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
    unique.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    setBookings(unique);
  }, [orgIds.join(',')]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAccept = (id: string) => {
    Alert.alert('Accept Booking', 'Accept this meeting?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          await apiAcceptBooking(id);
          await loadData();
        },
      },
    ]);
  };

  const handleCancel = (id: string) => {
    Alert.alert('Cancel Meeting', 'Are you sure?', [
      { text: 'Back', style: 'cancel' },
      {
        text: 'Cancel Meeting',
        style: 'destructive',
        onPress: async () => {
          await apiCancelBooking(id);
          await loadData();
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen />;

  const now = new Date();
  const totalCount = bookings.length;
  const upcomingCount = bookings.filter((b) => new Date(b.startTime) > now && b.status !== 'CANCELLED').length;
  const completedCount = bookings.filter((b) => new Date(b.endTime) <= now && b.status !== 'CANCELLED').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Meetings</Text>
          <Text style={styles.subtitle}>Manage and track your sessions.</Text>
        </View>

        {/* Book button for clients */}
        {isClient && (user?.memberships ?? []).length > 0 && (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => {
              const firstOrg = user?.memberships[0]?.organisationId;
              if (firstOrg) {
                router.push({ pathname: '/(app)/meetings/book', params: { orgId: firstOrg } });
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>+ Book Meeting</Text>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: totalCount },
            { label: 'Upcoming', value: upcomingCount },
            { label: 'Completed', value: completedCount },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Bookings list */}
        {bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No meetings scheduled</Text>
            <Text style={styles.emptyText}>
              {isClient ? 'Start by booking your first meeting.' : 'No meetings have been booked yet.'}
            </Text>
          </View>
        ) : (
          bookings.map((b) => {
            const statusStyle = STATUS_COLORS[b.status] ?? { bg: '#f3f4f6', text: '#374151' };
            const canAccept =
              b.status === 'PENDING' &&
              (b.client.id === user?.id || b.member.id === user?.id);
            const canCancel = b.status !== 'CANCELLED';

            return (
              <View key={b.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingReason} numberOfLines={1}>{b.reason}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.bookingTime}>
                  {new Date(b.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  {' – '}
                  {new Date(b.endTime).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                </Text>
                <Text style={styles.bookingMeta}>
                  {isBusinessOwner
                    ? `Client: ${b.client.name ?? b.client.email} · Staff: ${b.member.name ?? b.member.email}`
                    : user?.accountType === 'business'
                    ? `Client: ${b.client.name ?? b.client.email}`
                    : `Staff: ${b.member.name ?? b.member.email}`}
                  {' · '}
                  {b.organisation?.name}
                </Text>
                {(canAccept || canCancel) && (
                  <View style={styles.actionRow}>
                    {canAccept && (
                      <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(b.id)}>
                        <Text style={styles.acceptBtnText}>Accept</Text>
                      </TouchableOpacity>
                    )}
                    {canCancel && (
                      <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(b.id)}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  bookButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 20,
  },
  bookButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: { fontSize: 24, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2, fontWeight: '600' },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 },
  emptyText: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingReason: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  bookingTime: { fontSize: 13, color: '#4b5563', marginBottom: 3 },
  bookingMeta: { fontSize: 12, color: '#9ca3af' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  acceptBtn: { backgroundColor: '#10b981', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  acceptBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cancelBtn: { backgroundColor: '#fee2e2', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  cancelBtnText: { color: '#991b1b', fontSize: 13, fontWeight: '600' },
});
