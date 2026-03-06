export interface Meeting {
  id: string;
  title: string;
  organizer: string;
  date: string; // ISO-8601
  durationMinutes: number;
  location: string;
  description: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export const MEETINGS_SEED: Meeting[] = [
  {
    id: '1',
    title: 'Q1 Planning',
    organizer: 'Alice Johnson',
    date: '2026-03-15T10:00:00Z',
    durationMinutes: 60,
    location: 'Conference Room A',
    description: 'Quarterly planning session to align on goals and OKRs for Q1.',
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Design Review',
    organizer: 'Bob Smith',
    date: '2026-03-18T14:00:00Z',
    durationMinutes: 45,
    location: 'Zoom (link in invite)',
    description: 'Review new UI mockups for the mobile app redesign.',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Engineering Sync',
    organizer: 'Carol White',
    date: '2026-03-20T09:30:00Z',
    durationMinutes: 30,
    location: 'Slack Huddle',
    description: 'Weekly cross-team engineering sync to discuss blockers.',
    status: 'upcoming',
  },
  {
    id: '4',
    title: 'Onboarding — New Hire',
    organizer: 'David Lee',
    date: '2026-03-10T11:00:00Z',
    durationMinutes: 90,
    location: 'HR Office',
    description: 'Welcome session and onboarding walkthrough for new team members.',
    status: 'completed',
  },
  {
    id: '5',
    title: 'Budget Review',
    organizer: 'Eva Martinez',
    date: '2026-03-05T15:00:00Z',
    durationMinutes: 60,
    location: 'Boardroom',
    description: 'Annual budget review and forecast alignment with finance.',
    status: 'cancelled',
  },
];

export function getMeetings(): Meeting[] {
  return MEETINGS_SEED;
}

export function getMeetingById(id: string): Meeting | undefined {
  return MEETINGS_SEED.find((m) => m.id === id);
}

export function formatMeetingDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMeetingTime(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
