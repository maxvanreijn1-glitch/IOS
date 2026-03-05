import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';

export default function HomeScreen() {
  const handleOpenWeb = () => {
    Linking.openURL('https://meetings-managed.com');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meetings Managed</Text>
        <Text style={styles.subtitle}>by Deliverance</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.description}>
          Streamline your meeting scheduling and management.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleOpenWeb}>
          <Text style={styles.buttonText}>Open Web App</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {'\u00A9'} {new Date().getFullYear()} Deliverance. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  body: {
    alignItems: 'center',
    gap: 24,
  },
  description: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 28,
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
