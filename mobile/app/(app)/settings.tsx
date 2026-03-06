import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiDeleteAccount } from '@/lib/api';
import ErrorMessage from '@/components/ErrorMessage';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            setDeleteError('');
            try {
              await apiDeleteAccount();
              await logout();
              router.replace('/(auth)/login');
            } catch (e: any) {
              setDeleteError(e.message ?? 'Delete failed');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>

        {/* Account info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <DetailRow label="Name" value={user?.name ?? '—'} />
            <View style={styles.divider} />
            <DetailRow label="Email" value={user?.email ?? '—'} />
            <View style={styles.divider} />
            <DetailRow label="Type" value={user?.accountType ?? '—'} capitalize />
          </View>
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <View style={[styles.card, styles.dangerCard]}>
            <Text style={styles.dangerDesc}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </Text>

            <ErrorMessage message={deleteError} />

            <Text style={styles.fieldLabel}>
              Type <Text style={styles.fieldLabelBold}>DELETE</Text> to confirm
            </Text>
            <TextInput
              style={styles.deleteInput}
              placeholder="DELETE"
              placeholderTextColor="#fca5a5"
              value={deleteConfirm}
              onChangeText={setDeleteConfirm}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.deleteButton, (deleteConfirm !== 'DELETE' || deleting) && styles.deleteButtonDisabled]}
              onPress={handleDeleteAccount}
              disabled={deleteConfirm !== 'DELETE' || deleting}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>
                {deleting ? 'Deleting…' : 'Delete My Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  row: { flexDirection: 'row', paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center' },
  label: { width: 80, fontSize: 13, fontWeight: '600', color: '#6b7280' },
  value: { flex: 1, fontSize: 14, color: '#111827' },
  capitalize: { textTransform: 'capitalize' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', letterSpacing: -0.5, marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#6b7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },
  signOutButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  signOutText: { fontSize: 16, fontWeight: '700', color: '#ef4444' },
  dangerTitle: { fontSize: 11, fontWeight: '700', color: '#ef4444', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  dangerCard: { borderColor: '#fecaca', padding: 16 },
  dangerDesc: { fontSize: 13, color: '#6b7280', lineHeight: 19, marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: '#374151', marginBottom: 8 },
  fieldLabelBold: { fontWeight: '700', color: '#ef4444' },
  deleteInput: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff5f5',
    marginBottom: 14,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  deleteButtonDisabled: { opacity: 0.4 },
  deleteButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
