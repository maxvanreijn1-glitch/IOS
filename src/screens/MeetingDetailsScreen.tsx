import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { getMeetingById, formatMeetingDate, formatMeetingTime } from '../data/meetings';
import type { Meeting } from '../data/meetings';
import type { MeetingDetailsScreenProps } from '../navigation/types';

const STATUS_LABELS: Record<Meeting['status'], string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_STYLES: Record<
  Meeting['status'],
  { bg: string; text: string }
> = {
  upcoming: { bg: '#d1fae5', text: '#065f46' },
  completed: { bg: '#f3f4f6', text: '#374151' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function MeetingDetailsScreen({
  route,
  navigation,
}: MeetingDetailsScreenProps) {
  const meeting = getMeetingById(route.params.meetingId);

  if (!meeting) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Meeting not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusStyle = STATUS_STYLES[meeting.status];

  const handleAction = (action: string) => {
    Alert.alert(action, `"${action}" action for "${meeting.title}" is not yet implemented.`);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Title + status */}
      <View style={styles.header}>
        <Text style={styles.title}>{meeting.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {STATUS_LABELS[meeting.status]}
          </Text>
        </View>
      </View>

      {/* Details card */}
      <View style={styles.card}>
        <InfoRow
          label="Date"
          value={`${formatMeetingDate(meeting.date)} at ${formatMeetingTime(meeting.date)}`}
        />
        <View style={styles.divider} />
        <InfoRow label="Duration" value={`${meeting.durationMinutes} minutes`} />
        <View style={styles.divider} />
        <InfoRow label="Organizer" value={meeting.organizer} />
        <View style={styles.divider} />
        <InfoRow label="Location" value={meeting.location} />
      </View>

      {/* Description */}
      <Text style={styles.sectionTitle}>Description</Text>
      <View style={styles.card}>
        <Text style={styles.description}>{meeting.description}</Text>
      </View>

      {/* Actions */}
      {meeting.status === 'upcoming' && (
        <>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() => handleAction('Accept')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnTextPrimary}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDanger]}
              onPress={() => handleAction('Decline')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnTextDanger}>Decline</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFound: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    paddingVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  actionBtnPrimary: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  actionBtnDanger: {
    backgroundColor: '#fff',
    borderColor: '#ef4444',
  },
  actionBtnTextPrimary: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  actionBtnTextDanger: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 15,
  },
});
