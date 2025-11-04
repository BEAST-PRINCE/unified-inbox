import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the register page instead of login
  redirect('/register');
}