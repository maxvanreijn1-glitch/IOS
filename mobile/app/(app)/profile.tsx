import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user } = useAuth();

  const initial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your account details.</Text>

        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.displayName}>{user?.name ?? '—'}</Text>
          <Text style={styles.displayEmail}>{user?.email}</Text>
          <View style={[styles.typeBadge, user?.accountType === 'business' ? styles.typeBusiness : styles.typeClient]}>
            <Text style={[styles.typeText, user?.accountType === 'business' ? styles.typeTextBusiness : styles.typeTextClient]}>
              {user?.accountType === 'business' ? '🏢 Business' : '👤 Client'}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailCard}>
          <DetailRow label="Full name" value={user?.name ?? '—'} />
          <View style={styles.divider} />
          <DetailRow label="Email" value={user?.email ?? '—'} />
          <View style={styles.divider} />
          <DetailRow label="Account type" value={user?.accountType ?? '—'} capitalize />
        </View>

        {/* Organisations */}
        {(user?.memberships?.length ?? 0) > 0 && (
          <View style={styles.orgsCard}>
            <Text style={styles.orgsTitle}>Organisations</Text>
            {user?.memberships.map((m) => (
              <View key={m.organisationId} style={styles.orgRow}>
                <Text style={styles.orgName}>{m.organisationName}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{m.role}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          To update your account details, visit Settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, capitalize && rowStyles.capitalize]}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  label: { width: 110, fontSize: 13, fontWeight: '600', color: '#6b7280' },
  value: { flex: 1, fontSize: 14, color: '#111827' },
  capitalize: { textTransform: 'capitalize' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 24 },
  avatarCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '800' },
  displayName: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  displayEmail: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  typeBadge: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4 },
  typeBusiness: { backgroundColor: '#d1fae5' },
  typeClient: { backgroundColor: '#ede9fe' },
  typeText: { fontSize: 12, fontWeight: '700' },
  typeTextBusiness: { color: '#065f46' },
  typeTextClient: { color: '#4c1d95' },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },
  orgsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  orgsTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  orgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  orgName: { fontSize: 14, color: '#111827', fontWeight: '500' },
  roleBadge: { backgroundColor: '#f3f4f6', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  roleText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  footer: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
});
