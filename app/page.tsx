import { redirect } from 'next/navigation';

// The landing page has been retired. Users are directed straight to login.
export default function HomePage() {
  redirect('/login');
}