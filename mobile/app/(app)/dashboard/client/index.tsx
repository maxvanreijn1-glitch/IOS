import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function ClientDashboard() {
  const { user } = useAuth();
  const clientMemberships = (user?.memberships ?? []).filter((m) => m.role === 'CLIENT');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hey, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </Text>
          <Text style={styles.title}>Your Organisations</Text>
          <Text style={styles.subtitle}>Select one to view your dashboard.</Text>
        </View>

        {clientMemberships.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔗</Text>
            <Text style={styles.emptyText}>No organisations yet</Text>
            <Text style={styles.emptySubtext}>
              Ask your organisation admin for an invite link to join.
            </Text>
          </View>
        ) : (
          clientMemberships.map((m) => (
            <TouchableOpacity
              key={m.organisationId}
              style={styles.orgCard}
              onPress={() => router.push(`/(app)/dashboard/client/${m.organisationId}`)}
              activeOpacity={0.7}
            >
              <View style={styles.orgIconCircle}>
                <Text style={styles.orgIconText}>
                  {m.organisationName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.orgInfo}>
                <Text style={styles.orgName}>{m.organisationName}</Text>
                <Text style={styles.orgRole}>View dashboard →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 28 },
  greeting: { fontSize: 14, color: '#10b981', fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 6 },
  emptySubtext: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },
  orgCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  orgIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  orgIconText: { fontSize: 18, fontWeight: '700', color: '#065f46' },
  orgInfo: { flex: 1 },
  orgName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  orgRole: { fontSize: 13, color: '#10b981', marginTop: 2, fontWeight: '500' },
});
