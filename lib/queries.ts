import { db } from './db';

export type UserState = {
  id: number;
  current_phase: number;
  current_week: number;
  last_tab: string;
  updated_at: string;
};

export type WeekLog = {
  week_number: number;
  days: string;
  notes: string;
  updated_at: string;
};

export type SkillRating = {
  skill_key: string;
  rating: number;
  updated_at: string;
};

export function getUserState(): UserState {
  return db.prepare('SELECT * FROM user_state WHERE id = 1').get() as UserState;
}

export function getWeekLog(weekNumber: number): WeekLog | undefined {
  return db.prepare('SELECT * FROM week_logs WHERE week_number = ?').get(weekNumber) as WeekLog | undefined;
}

export function getAllWeekLogs(): WeekLog[] {
  return db.prepare('SELECT * FROM week_logs ORDER BY week_number').all() as WeekLog[];
}

export function getSkillRatings(): SkillRating[] {
  return db.prepare('SELECT * FROM skill_ratings ORDER BY skill_key').all() as SkillRating[];
}
