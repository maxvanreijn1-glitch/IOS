import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ─── Auth Stack ────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

// ─── Meetings Stack (nested inside the Meetings tab) ──────────────────────────
export type MeetingsStackParamList = {
  MeetingsList: undefined;
  MeetingDetails: { meetingId: string };
};

export type MeetingsListScreenProps = NativeStackScreenProps<
  MeetingsStackParamList,
  'MeetingsList'
>;
export type MeetingDetailsScreenProps = NativeStackScreenProps<
  MeetingsStackParamList,
  'MeetingDetails'
>;

// ─── App Tabs ─────────────────────────────────────────────────────────────────
export type AppTabParamList = {
  Meetings: undefined;
  Settings: undefined;
};

export type SettingsScreenProps = BottomTabScreenProps<AppTabParamList, 'Settings'>;
