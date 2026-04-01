'use server';

import { updateLastTab as updateTab } from '@/lib/mutations';

export async function updateLastTab(tab: string): Promise<void> {
  updateTab(tab);
}
