import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { apiGetOrgMembers, apiCreateBooking } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ErrorMessage from '@/components/ErrorMessage';

interface Member {
  userId: string;
  user: { id: string; name: string | null; email: string };
}

const HOURS = Array.from({ length: 10 }, (_, i) => {
  const hour = 8 + i;
  return `${hour.toString().padStart(2, '0')}:00`;
});

export default function BookMeetingScreen() {
  const { orgId } = useLocalSearchParams<{ orgId: string }>();
  const { user } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Build next 14 days for date picker
  const dates: Date[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  useEffect(() => {
    if (!orgId) return;
    apiGetOrgMembers(orgId).then(setMembers).catch(() => {});
  }, [orgId]);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !selectedMemberId || !reason.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime.getTime() + duration * 60_000);

      await apiCreateBooking({
        organisationId: orgId!,
        memberId: selectedMemberId,
        reason: reason.trim(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      Alert.alert('Booking Requested', 'Your meeting request has been sent.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      setError(e.message ?? 'Failed to book meeting');
    } finally {
      setLoading(false);
    }
  };

  const orgName =
    user?.memberships.find((m) => m.organisationId === orgId)?.organisationName ?? '';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Book a Meeting</Text>
          {orgName ? <Text style={styles.subtitle}>{orgName}</Text> : null}

          <ErrorMessage message={error} />

          {/* Step 1: Date */}
          <Text style={styles.stepLabel}>Select a Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
            {dates.map((d) => {
              const isSelected =
                selectedDate?.toDateString() === d.toDateString();
              return (
                <TouchableOpacity
                  key={d.toISOString()}
                  style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                  onPress={() => {
                    setSelectedDate(d);
                    setSelectedTime(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateChipDay, isSelected && styles.dateChipDaySelected]}>
                    {d.toLocaleDateString(undefined, { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dateChipNum, isSelected && styles.dateChipNumSelected]}>
                    {d.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Step 2: Time */}
          {selectedDate && (
            <>
              <Text style={styles.stepLabel}>Select a Time</Text>
              <View style={styles.timeGrid}>
                {HOURS.map((t) => {
                  const isSelected = selectedTime === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                      onPress={() => setSelectedTime(t)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Step 3: Booking details */}
          {selectedDate && selectedTime && (
            <>
              <Text style={styles.stepLabel}>Meeting Details</Text>

              {/* Staff member */}
              <Text style={styles.fieldLabel}>Staff Member</Text>
              <View style={styles.memberList}>
                {members.length === 0 ? (
                  <Text style={styles.noMembers}>No staff members available.</Text>
                ) : (
                  members.map((m) => {
                    const isSelected = selectedMemberId === m.user.id;
                    return (
                      <TouchableOpacity
                        key={m.user.id}
                        style={[styles.memberChip, isSelected && styles.memberChipSelected]}
                        onPress={() => setSelectedMemberId(m.user.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.memberAvatar}>
                          <Text style={styles.memberAvatarText}>
                            {(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={[styles.memberName, isSelected && styles.memberNameSelected]}>
                          {m.user.name ?? m.user.email}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              {/* Duration */}
              <Text style={styles.fieldLabel}>Duration</Text>
              <View style={styles.durationRow}>
                {[30, 60, 90, 120].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.durationChip, duration === d && styles.durationChipSelected]}
                    onPress={() => setDuration(d)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.durationText, duration === d && styles.durationTextSelected]}>
                      {d}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Reason */}
              <Text style={styles.fieldLabel}>Reason / Topic</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe the purpose of this meeting…"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                value={reason}
                onChangeText={setReason}
              />

              {/* Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Booking Summary</Text>
                <Text style={styles.summaryText}>
                  📅 {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
                <Text style={styles.summaryText}>🕐 {selectedTime} · {duration} min</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleBook}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Booking…' : 'Request Meeting'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, paddingBottom: 60 },
  backRow: { marginBottom: 16 },
  backText: { color: '#10b981', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 20 },
  stepLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 12,
  },
  dateRow: { marginHorizontal: -4, paddingVertical: 4 },
  dateChip: {
    width: 52,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  dateChipSelected: { borderColor: '#10b981', backgroundColor: '#10b981' },
  dateChipDay: { fontSize: 10, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' },
  dateChipDaySelected: { color: '#d1fae5' },
  dateChipNum: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 2 },
  dateChipNumSelected: { color: '#fff' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  timeChipSelected: { borderColor: '#10b981', backgroundColor: '#10b981' },
  timeChipText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  timeChipTextSelected: { color: '#fff' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 4 },
  memberList: { gap: 8, marginBottom: 4 },
  noMembers: { fontSize: 14, color: '#9ca3af' },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  memberChipSelected: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: { fontSize: 14, fontWeight: '700', color: '#065f46' },
  memberName: { fontSize: 14, fontWeight: '500', color: '#374151' },
  memberNameSelected: { color: '#065f46', fontWeight: '600' },
  durationRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  durationChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  durationChipSelected: { borderColor: '#10b981', backgroundColor: '#10b981' },
  durationText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  durationTextSelected: { color: '#fff' },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 4,
  },
  summaryCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: '#065f46', marginBottom: 6 },
  summaryText: { fontSize: 14, color: '#047857', marginBottom: 2 },
  submitButton: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
