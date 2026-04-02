import { describe, test, expect, beforeEach } from 'bun:test';
import { Database } from 'bun:sqlite';

function setupTestDb() {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_phase INTEGER NOT NULL DEFAULT 0,
      current_week INTEGER NOT NULL DEFAULT 1,
      last_tab TEXT NOT NULL DEFAULT 'plan',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS week_logs (
      week_number INTEGER PRIMARY KEY,
      days TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS skill_ratings (
      skill_key TEXT PRIMARY KEY,
      rating INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    INSERT OR IGNORE INTO user_state (id) VALUES (1);
    INSERT OR IGNORE INTO skill_ratings (skill_key) VALUES
      ('sentence_variety'),('paragraph_structure'),('voice_tone'),
      ('storytelling'),('business_writing'),('editing_revision');
  `);
  return db;
}

// Inline mutation functions to test logic without module-level db import
function createMutations(db: Database) {
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

  function toggleDay(weekNumber: number, dayIndex: number): void {
    validateWeekNumber(weekNumber);
    validateDayIndex(dayIndex);
    db.transaction(() => {
      db.prepare('INSERT OR IGNORE INTO week_logs (week_number) VALUES (?)').run(weekNumber);
      const row = db.prepare('SELECT days FROM week_logs WHERE week_number = ?').get(weekNumber) as { days: string };
      const days: number[] = JSON.parse(row.days);
      const idx = days.indexOf(dayIndex);
      if (idx === -1) { days.push(dayIndex); days.sort(); } else { days.splice(idx, 1); }
      db.prepare("UPDATE week_logs SET days = ?, updated_at = datetime('now') WHERE week_number = ?").run(JSON.stringify(days), weekNumber);
    })();
  }

  function saveNotes(weekNumber: number, notes: string): void {
    validateWeekNumber(weekNumber);
    db.prepare('INSERT OR IGNORE INTO week_logs (week_number) VALUES (?)').run(weekNumber);
    db.prepare("UPDATE week_logs SET notes = ?, updated_at = datetime('now') WHERE week_number = ?").run(notes, weekNumber);
  }

  function setCurrentPhase(phaseId: number): void {
    if (!Number.isInteger(phaseId) || phaseId < 0 || phaseId > 3) {
      throw new Error(`Invalid phase: ${phaseId}. Must be 0–3.`);
    }
    db.prepare("UPDATE user_state SET current_phase = ?, updated_at = datetime('now') WHERE id = 1").run(phaseId);
  }

  function updateCurrentWeek(weekNumber: number): void {
    validateWeekNumber(weekNumber);
    db.prepare("UPDATE user_state SET current_week = ?, updated_at = datetime('now') WHERE id = 1").run(weekNumber);
  }

  function updateLastTab(tab: string): void {
    if (!VALID_TABS.includes(tab as typeof VALID_TABS[number])) {
      throw new Error(`Invalid tab: ${tab}. Must be one of: ${VALID_TABS.join(', ')}.`);
    }
    db.prepare("UPDATE user_state SET last_tab = ?, updated_at = datetime('now') WHERE id = 1").run(tab);
  }

  function setSkillRating(skillKey: string, rating: number): void {
    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      throw new Error(`Invalid rating: ${rating}. Must be 0–5.`);
    }
    const result = db.prepare("UPDATE skill_ratings SET rating = ?, updated_at = datetime('now') WHERE skill_key = ?").run(rating, skillKey);
    if (result.changes === 0) {
      throw new Error(`Unknown skill key: ${skillKey}.`);
    }
  }

  return { toggleDay, saveNotes, setCurrentPhase, updateCurrentWeek, updateLastTab, setSkillRating };
}

let db: Database;
let m: ReturnType<typeof createMutations>;

beforeEach(() => {
  db = setupTestDb();
  m = createMutations(db);
});

describe('toggleDay', () => {
  test('adds a day to an empty week', () => {
    m.toggleDay(1, 0);
    const row = db.prepare('SELECT days FROM week_logs WHERE week_number = 1').get() as { days: string };
    expect(JSON.parse(row.days)).toEqual([0]);
  });

  test('toggle same day twice removes it', () => {
    m.toggleDay(1, 3);
    m.toggleDay(1, 3);
    const row = db.prepare('SELECT days FROM week_logs WHERE week_number = 1').get() as { days: string };
    expect(JSON.parse(row.days)).toEqual([]);
  });

  test('keeps days sorted', () => {
    m.toggleDay(1, 5);
    m.toggleDay(1, 1);
    m.toggleDay(1, 3);
    const row = db.prepare('SELECT days FROM week_logs WHERE week_number = 1').get() as { days: string };
    expect(JSON.parse(row.days)).toEqual([1, 3, 5]);
  });

  test('rejects invalid week number', () => {
    expect(() => m.toggleDay(0, 0)).toThrow('Invalid week number');
    expect(() => m.toggleDay(53, 0)).toThrow('Invalid week number');
    expect(() => m.toggleDay(1.5, 0)).toThrow('Invalid week number');
  });

  test('rejects invalid day index', () => {
    expect(() => m.toggleDay(1, -1)).toThrow('Invalid day index');
    expect(() => m.toggleDay(1, 7)).toThrow('Invalid day index');
  });
});

describe('saveNotes', () => {
  test('saves notes to a new week', () => {
    m.saveNotes(5, 'hello world');
    const row = db.prepare('SELECT notes FROM week_logs WHERE week_number = 5').get() as { notes: string };
    expect(row.notes).toBe('hello world');
  });

  test('overwrites existing notes', () => {
    m.saveNotes(5, 'first');
    m.saveNotes(5, 'second');
    const row = db.prepare('SELECT notes FROM week_logs WHERE week_number = 5').get() as { notes: string };
    expect(row.notes).toBe('second');
  });

  test('handles empty string', () => {
    m.saveNotes(1, '');
    const row = db.prepare('SELECT notes FROM week_logs WHERE week_number = 1').get() as { notes: string };
    expect(row.notes).toBe('');
  });

  test('handles special characters', () => {
    const special = "'; DROP TABLE week_logs; --";
    m.saveNotes(1, special);
    const row = db.prepare('SELECT notes FROM week_logs WHERE week_number = 1').get() as { notes: string };
    expect(row.notes).toBe(special);
  });

  test('rejects invalid week', () => {
    expect(() => m.saveNotes(0, 'test')).toThrow('Invalid week number');
    expect(() => m.saveNotes(53, 'test')).toThrow('Invalid week number');
  });
});

describe('setCurrentPhase', () => {
  test('sets valid phases 0-3', () => {
    for (const p of [0, 1, 2, 3]) {
      m.setCurrentPhase(p);
      const row = db.prepare('SELECT current_phase FROM user_state WHERE id = 1').get() as { current_phase: number };
      expect(row.current_phase).toBe(p);
    }
  });

  test('rejects invalid phases', () => {
    expect(() => m.setCurrentPhase(-1)).toThrow('Invalid phase');
    expect(() => m.setCurrentPhase(4)).toThrow('Invalid phase');
    expect(() => m.setCurrentPhase(1.5)).toThrow('Invalid phase');
  });
});

describe('updateCurrentWeek', () => {
  test('sets valid week', () => {
    m.updateCurrentWeek(26);
    const row = db.prepare('SELECT current_week FROM user_state WHERE id = 1').get() as { current_week: number };
    expect(row.current_week).toBe(26);
  });

  test('boundary values 1 and 52', () => {
    m.updateCurrentWeek(1);
    m.updateCurrentWeek(52);
    const row = db.prepare('SELECT current_week FROM user_state WHERE id = 1').get() as { current_week: number };
    expect(row.current_week).toBe(52);
  });

  test('rejects out of range', () => {
    expect(() => m.updateCurrentWeek(0)).toThrow('Invalid week number');
    expect(() => m.updateCurrentWeek(53)).toThrow('Invalid week number');
  });
});

describe('updateLastTab', () => {
  test('sets valid tabs', () => {
    for (const tab of ['plan', 'this-week', 'skills', 'log']) {
      m.updateLastTab(tab);
      const row = db.prepare('SELECT last_tab FROM user_state WHERE id = 1').get() as { last_tab: string };
      expect(row.last_tab).toBe(tab);
    }
  });

  test('rejects invalid tab', () => {
    expect(() => m.updateLastTab('invalid')).toThrow('Invalid tab');
    expect(() => m.updateLastTab('')).toThrow('Invalid tab');
  });
});

describe('setSkillRating', () => {
  test('sets valid rating', () => {
    m.setSkillRating('storytelling', 4);
    const row = db.prepare("SELECT rating FROM skill_ratings WHERE skill_key = 'storytelling'").get() as { rating: number };
    expect(row.rating).toBe(4);
  });

  test('rating 0 clears it', () => {
    m.setSkillRating('storytelling', 5);
    m.setSkillRating('storytelling', 0);
    const row = db.prepare("SELECT rating FROM skill_ratings WHERE skill_key = 'storytelling'").get() as { rating: number };
    expect(row.rating).toBe(0);
  });

  test('rejects invalid rating', () => {
    expect(() => m.setSkillRating('storytelling', -1)).toThrow('Invalid rating');
    expect(() => m.setSkillRating('storytelling', 6)).toThrow('Invalid rating');
    expect(() => m.setSkillRating('storytelling', 2.5)).toThrow('Invalid rating');
  });

  test('rejects unknown skill key', () => {
    expect(() => m.setSkillRating('nonexistent', 3)).toThrow('Unknown skill key');
  });
});
