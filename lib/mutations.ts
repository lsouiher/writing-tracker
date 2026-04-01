import { db } from './db';

const VALID_TABS = ['plan', 'this-week', 'skills', 'log'] as const;

function validateWeekNumber(weekNumber: number): void {
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 52) {
    throw new Error(`Invalid week number: ${weekNumber}. Must be 1–52.`);
  }
}

function validateDayIndex(dayIndex: number): void {
  if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex > 6) {
    throw new Error(`Invalid day index: ${dayIndex}. Must be 0–6.`);
  }
}

export function toggleDay(weekNumber: number, dayIndex: number): void {
  validateWeekNumber(weekNumber);
  validateDayIndex(dayIndex);

  db.prepare(
    `INSERT OR IGNORE INTO week_logs (week_number) VALUES (?)`
  ).run(weekNumber);

  const row = db.prepare(
    'SELECT days FROM week_logs WHERE week_number = ?'
  ).get(weekNumber) as { days: string };

  const days: number[] = JSON.parse(row.days);
  const idx = days.indexOf(dayIndex);

  if (idx === -1) {
    days.push(dayIndex);
    days.sort();
  } else {
    days.splice(idx, 1);
  }

  db.prepare(
    `UPDATE week_logs SET days = ?, updated_at = datetime('now') WHERE week_number = ?`
  ).run(JSON.stringify(days), weekNumber);
}

export function saveNotes(weekNumber: number, notes: string): void {
  validateWeekNumber(weekNumber);

  db.prepare(
    `INSERT OR IGNORE INTO week_logs (week_number) VALUES (?)`
  ).run(weekNumber);

  db.prepare(
    `UPDATE week_logs SET notes = ?, updated_at = datetime('now') WHERE week_number = ?`
  ).run(notes, weekNumber);
}

export function setCurrentPhase(phaseId: number): void {
  if (!Number.isInteger(phaseId) || phaseId < 0 || phaseId > 3) {
    throw new Error(`Invalid phase: ${phaseId}. Must be 0–3.`);
  }

  db.prepare(
    `UPDATE user_state SET current_phase = ?, updated_at = datetime('now') WHERE id = 1`
  ).run(phaseId);
}

export function updateCurrentWeek(weekNumber: number): void {
  validateWeekNumber(weekNumber);

  db.prepare(
    `UPDATE user_state SET current_week = ?, updated_at = datetime('now') WHERE id = 1`
  ).run(weekNumber);
}

export function updateLastTab(tab: string): void {
  if (!VALID_TABS.includes(tab as typeof VALID_TABS[number])) {
    throw new Error(`Invalid tab: ${tab}. Must be one of: ${VALID_TABS.join(', ')}.`);
  }

  db.prepare(
    `UPDATE user_state SET last_tab = ?, updated_at = datetime('now') WHERE id = 1`
  ).run(tab);
}

export function setSkillRating(skillKey: string, rating: number): void {
  if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    throw new Error(`Invalid rating: ${rating}. Must be 0–5.`);
  }

  const result = db.prepare(
    `UPDATE skill_ratings SET rating = ?, updated_at = datetime('now') WHERE skill_key = ?`
  ).run(rating, skillKey);

  if (result.changes === 0) {
    throw new Error(`Unknown skill key: ${skillKey}.`);
  }
}
