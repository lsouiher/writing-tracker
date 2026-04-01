'use server';

import { revalidatePath } from 'next/cache';
import { setCurrentPhase as setPhase } from '@/lib/mutations';

export async function setCurrentPhase(phaseId: number): Promise<void> {
  setPhase(phaseId);
  revalidatePath('/plan');
  revalidatePath('/this-week');
}
