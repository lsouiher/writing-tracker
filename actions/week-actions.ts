'use server';

import { revalidatePath } from 'next/cache';
import { toggleDay as toggle, saveNotes as save, updateCurrentWeek } from '@/lib/mutations';

export async function toggleDay(weekNumber: number, dayIndex: number): Promise<void> {
  toggle(weekNumber, dayIndex);
  revalidatePath('/this-week');
}

export async function saveNotes(weekNumber: number, notes: string): Promise<void> {
  save(weekNumber, notes);
  revalidatePath('/this-week');
}

export async function navigateWeek(weekNumber: number): Promise<void> {
  updateCurrentWeek(weekNumber);
  revalidatePath('/this-week');
}
