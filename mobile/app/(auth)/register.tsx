import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import ErrorMessage from '@/components/ErrorMessage';

type Step = 'choose' | 'form';
type AccountType = 'client' | 'business' | null;

export default function RegisterScreen() {
  const { register } = useAuth();
  const [step, setStep] = useState<Step>('choose');
  const [accountType, setAccountType] = useState<AccountType>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChoose = (type: AccountType) => {
    setAccountType(type);
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (accountType === 'business' && !orgName.trim()) {
      setError('Organisation name is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        accountType: accountType as 'client' | 'business',
        orgName: accountType === 'business' ? orgName.trim() : undefined,
      });
      router.replace('/(app)/dashboard');
    } catch (e: any) {
      setError(e.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.topRow}>
          {step !== 'choose' && (
            <TouchableOpacity onPress={() => setStep('choose')}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title}>
          {step === 'choose' ? 'Create Your Account' : 'Complete Setup'}
        </Text>

        {step === 'choose' ? (
          <View style={styles.choiceContainer}>
            <TouchableOpacity
              style={styles.choiceCard}
              onPress={() => handleChoose('business')}
              activeOpacity={0.8}
            >
              <Text style={styles.choiceIcon}>🏢</Text>
              <Text style={styles.choiceTitle}>Business Account</Text>
              <Text style={styles.choiceDesc}>
                Manage your organisation, team members, and bookings.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.choiceCard}
              onPress={() => handleChoose('client')}
              activeOpacity={0.8}
            >
              <Text style={styles.choiceIcon}>👤</Text>
              <Text style={styles.choiceTitle}>Client Account</Text>
              <Text style={styles.choiceDesc}>
                Join organisations and schedule meetings.
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <ErrorMessage message={error} />

            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#9ca3af"
              autoComplete="name"
              textContentType="name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              textContentType="newPassword"
              value={password}
              onChangeText={setPassword}
            />
            {accountType === 'business' && (
              <TextInput
                style={styles.input}
                placeholder="Organisation name"
                placeholderTextColor="#9ca3af"
                value={orgName}
                onChangeText={setOrgName}
              />
            )}

            {accountType === 'business' && (
              <View style={styles.note}>
                <Text style={styles.noteText}>
                  ℹ️  Business accounts require an active subscription. You can set up billing after creating your account.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating account…' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  topRow: { marginBottom: 8 },
  backText: { color: '#10b981', fontSize: 16, fontWeight: '500' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 28,
    letterSpacing: -0.5,
  },
  choiceContainer: { gap: 16 },
  choiceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  choiceIcon: { fontSize: 32, marginBottom: 10 },
  choiceTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  choiceDesc: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  note: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  noteText: { color: '#92400e', fontSize: 13, lineHeight: 18 },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: { color: '#6b7280', fontSize: 14 },
  footerLink: { color: '#10b981', fontSize: 14, fontWeight: '600' },
});
