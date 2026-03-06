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
import { useLocalSearchParams, router } from 'expo-router';
import { apiGetBookings, apiAcceptBooking, apiCancelBooking } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

interface Booking {
  id: string;
  reason: string;
  startTime: string;
  endTime: string;
  status: string;
  clientAcceptedAt: string | null;
  memberAcceptedAt: string | null;
  client: { id: string; name: string | null; email: string };
  member: { id: string; name: string | null; email: string };
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#fef9c3', text: '#854d0e' },
  CONFIRMED: { bg: '#dcfce7', text: '#166534' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
  RESCHEDULED: { bg: '#dbeafe', text: '#1e40af' },
};

export default function ClientOrgScreen() {
  const { orgId } = useLocalSearchParams<{ orgId: string }>();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const membership = user?.memberships.find((m) => m.organisationId === orgId);
  const orgName = membership?.organisationName ?? '';

  const loadData = useCallback(async () => {
    if (!orgId) return;
    const b = await apiGetBookings(orgId);
    setBookings(b);
  }, [orgId]);

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
    Alert.alert('Accept Booking', 'Confirm accepting this booking?', [
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
    Alert.alert('Cancel Booking', 'Cancel this booking?', [
      { text: 'Back', style: 'cancel' },
      {
        text: 'Cancel Booking',
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
  const upcoming = bookings.filter((b) => new Date(b.startTime) > now && b.status !== 'CANCELLED');
  const past = bookings.filter((b) => new Date(b.endTime) <= now || b.status === 'CANCELLED');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
      >
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backText}>← My Organisations</Text>
        </TouchableOpacity>

        <Text style={styles.orgName}>{orgName}</Text>
        <Text style={styles.orgSubtitle}>Your bookings</Text>

        {/* Book button */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push({ pathname: '/(app)/meetings/book', params: { orgId } })}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>+ Book a Meeting</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{upcoming.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{past.length}</Text>
            <Text style={styles.statLabel}>Past</Text>
          </View>
        </View>

        {bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No meetings yet</Text>
            <Text style={styles.emptyText}>Book your first meeting above.</Text>
          </View>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                {upcoming.map((b) => (
                  <ClientBookingCard
                    key={b.id}
                    booking={b}
                    currentUserId={user?.id ?? ''}
                    onAccept={handleAccept}
                    onCancel={handleCancel}
                  />
                ))}
              </>
            )}
            {past.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Past / Cancelled</Text>
                {past.map((b) => (
                  <ClientBookingCard
                    key={b.id}
                    booking={b}
                    currentUserId={user?.id ?? ''}
                    onAccept={handleAccept}
                    onCancel={handleCancel}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ClientBookingCard({
  booking,
  currentUserId,
  onAccept,
  onCancel,
}: {
  booking: Booking;
  currentUserId: string;
  onAccept: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const statusStyle = STATUS_COLORS[booking.status] ?? { bg: '#f3f4f6', text: '#374151' };
  const isClient = booking.client.id === currentUserId;
  const hasClientAccepted = !!booking.clientAcceptedAt;
  const canAccept = booking.status === 'PENDING' && isClient && !hasClientAccepted;
  const canCancel = booking.status !== 'CANCELLED';

  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingReason} numberOfLines={1}>{booking.reason}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.bookingTime}>
        {new Date(booking.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
        {' – '}
        {new Date(booking.endTime).toLocaleTimeString(undefined, { timeStyle: 'short' })}
      </Text>
      <Text style={styles.bookingPeople}>
        Staff: {booking.member.name ?? booking.member.email}
      </Text>
      {(canAccept || canCancel) && (
        <View style={styles.actionRow}>
          {canAccept && (
            <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(booking.id)}>
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(booking.id)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, paddingBottom: 40 },
  backRow: { marginBottom: 16 },
  backText: { color: '#10b981', fontSize: 15, fontWeight: '600' },
  orgName: { fontSize: 26, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  orgSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 16 },
  bookButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 20,
  },
  bookButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
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
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 2, fontWeight: '500' },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 },
  emptyText: { fontSize: 13, color: '#9ca3af' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.4,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
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
  bookingPeople: { fontSize: 12, color: '#9ca3af' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  acceptBtn: { backgroundColor: '#10b981', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  acceptBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cancelBtn: { backgroundColor: '#fee2e2', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  cancelBtnText: { color: '#991b1b', fontSize: 13, fontWeight: '600' },
});
