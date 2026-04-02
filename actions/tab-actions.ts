'use server';

import { revalidatePath } from 'next/cache';
import { updateLastTab as updateTab } from '@/lib/mutations';

export async function updateLastTab(tab: string): Promise<void> {
  updateTab(tab);
  revalidatePath('/');
}
