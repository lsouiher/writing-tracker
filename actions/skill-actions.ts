'use server';

import { revalidatePath } from 'next/cache';
import { setSkillRating } from '@/lib/mutations';

export async function updateSkillRating(
  skillKey: string,
  rating: number
): Promise<void> {
  setSkillRating(skillKey, rating);
  revalidatePath('/skills');
}
