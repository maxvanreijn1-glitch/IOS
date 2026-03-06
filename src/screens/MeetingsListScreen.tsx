import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getMeetings } from '../data/meetings';
import type { Meeting } from '../data/meetings';
import type { MeetingsListScreenProps } from '../navigation/types';

const STATUS_COLORS: Record<Meeting['status'], string> = {
  upcoming: '#10b981',
  completed: '#6b7280',
  cancelled: '#ef4444',
};

function MeetingRow({
  item,
  onPress,
}: {
  item: Meeting;
  onPress: () => void;
}) {
  const d = new Date(item.date);
  const dateStr = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.rowMeta}>
            {dateStr} · {timeStr} · {item.durationMinutes} min
          </Text>
          <Text style={styles.rowOrganizer} numberOfLines={1}>
            {item.organizer} — {item.location}
          </Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function MeetingsListScreen({ navigation }: MeetingsListScreenProps) {
  const meetings = getMeetings();

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={meetings}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <MeetingRow
          item={item}
          onPress={() => navigation.navigate('MeetingDetails', { meetingId: item.id })}
        />
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>No meetings found.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  rowMeta: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  rowOrganizer: {
    fontSize: 13,
    color: '#9ca3af',
  },
  chevron: {
    fontSize: 22,
    color: '#d1d5db',
    marginLeft: 8,
  },
  separator: {
    height: 10,
  },
  empty: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 40,
    fontSize: 16,
  },
});
