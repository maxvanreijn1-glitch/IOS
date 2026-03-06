import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  message: string;
}

export default function ErrorMessage({ message }: Props) {
  if (!message) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  text: {
    color: '#ef4444',
    fontSize: 14,
  },
});
