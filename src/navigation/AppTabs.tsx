import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import MeetingsListScreen from '../screens/MeetingsListScreen';
import MeetingDetailsScreen from '../screens/MeetingDetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import type { MeetingsStackParamList, AppTabParamList } from './types';

// ─── Meetings stack (list + detail) ──────────────────────────────────────────
const MeetingsStack = createNativeStackNavigator<MeetingsStackParamList>();

function MeetingsNavigator() {
  return (
    <MeetingsStack.Navigator>
      <MeetingsStack.Screen
        name="MeetingsList"
        component={MeetingsListScreen}
        options={{ title: 'Meetings' }}
      />
      <MeetingsStack.Screen
        name="MeetingDetails"
        component={MeetingDetailsScreen}
        options={{ title: 'Meeting Details' }}
      />
    </MeetingsStack.Navigator>
  );
}

// ─── Bottom tabs ──────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { borderTopColor: '#e5e7eb' },
      }}
    >
      <Tab.Screen
        name="Meetings"
        component={MeetingsNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
