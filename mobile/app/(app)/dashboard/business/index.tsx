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

export default function BusinessDashboard() {
  const { user } = useAuth();

  const ownerMemberships = (user?.memberships ?? []).filter((m) => m.role === 'OWNER');
  const staffMemberships = (user?.memberships ?? []).filter((m) => m.role === 'MEMBER');

  // Legacy owned orgs not already in owner memberships
  const ownedOrgIds = new Set(ownerMemberships.map((m) => m.organisationId));
  const legacyOwned = (user?.ownedOrganisations ?? []).filter((o) => !ownedOrgIds.has(o.id));

  const navigateToOrg = (orgId: string) => {
    router.push(`/(app)/dashboard/business/${orgId}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hey, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </Text>
          <Text style={styles.title}>Business Dashboard</Text>
          <Text style={styles.subtitle}>Select an organisation to manage.</Text>
        </View>

        {ownerMemberships.length === 0 && legacyOwned.length === 0 && staffMemberships.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🏢</Text>
            <Text style={styles.emptyText}>No organisations found.</Text>
            <Text style={styles.emptySubtext}>
              Complete registration to create your first workspace.
            </Text>
          </View>
        ) : (
          <>
            {/* Owned orgs */}
            {(ownerMemberships.length > 0 || legacyOwned.length > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>ORGANISATIONS YOU OWN</Text>
                {ownerMemberships.map((m) => (
                  <TouchableOpacity
                    key={m.organisationId}
                    style={styles.orgCard}
                    onPress={() => navigateToOrg(m.organisationId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.orgIconCircle}>
                      <Text style={styles.orgIconText}>
                        {m.organisationName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.orgInfo}>
                      <Text style={styles.orgName}>{m.organisationName}</Text>
                      <Text style={styles.orgRole}>Admin view →</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {legacyOwned.map((o) => (
                  <TouchableOpacity
                    key={o.id}
                    style={styles.orgCard}
                    onPress={() => navigateToOrg(o.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.orgIconCircle}>
                      <Text style={styles.orgIconText}>{o.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.orgInfo}>
                      <Text style={styles.orgName}>{o.name}</Text>
                      <Text style={styles.orgRole}>Admin view →</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Staff orgs */}
            {staffMemberships.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>ORGANISATIONS YOU WORK IN</Text>
                {staffMemberships.map((m) => (
                  <TouchableOpacity
                    key={m.organisationId}
                    style={[styles.orgCard, styles.orgCardStaff]}
                    onPress={() => navigateToOrg(m.organisationId)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.orgIconCircle, styles.orgIconStaff]}>
                      <Text style={styles.orgIconText}>
                        {m.organisationName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.orgInfo}>
                      <Text style={styles.orgName}>{m.organisationName}</Text>
                      <Text style={styles.orgRole}>My bookings →</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
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
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 1.4,
    marginBottom: 12,
  },
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
  orgCardStaff: { borderColor: '#f3f4f6' },
  orgIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  orgIconStaff: { backgroundColor: '#f3f4f6' },
  orgIconText: { fontSize: 18, fontWeight: '700', color: '#065f46' },
  orgInfo: { flex: 1 },
  orgName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  orgRole: { fontSize: 13, color: '#10b981', marginTop: 2, fontWeight: '500' },
});
