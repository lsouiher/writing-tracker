import { redirect } from 'next/navigation';
import { getUserState } from '@/lib/queries';

export default function Home() {
  const state = getUserState();
  const tab = state?.last_tab ?? 'plan';
  redirect(`/${tab}`);
}
