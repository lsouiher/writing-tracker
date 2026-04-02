import { describe, test, expect } from 'bun:test';
import { phases, getPhaseForWeek, getExerciseForWeek } from '@/lib/program-content';

describe('phases data', () => {
  test('has 4 phases', () => {
    expect(phases).toHaveLength(4);
  });

  test('phases cover weeks 1-52 with no gaps', () => {
    const covered = new Set<number>();
    for (const phase of phases) {
      for (let w = phase.weekRange[0]; w <= phase.weekRange[1]; w++) {
        covered.add(w);
      }
    }
    for (let w = 1; w <= 52; w++) {
      expect(covered.has(w)).toBe(true);
    }
  });

  test('each phase has 8 exercises', () => {
    for (const phase of phases) {
      expect(phase.exercises).toHaveLength(8);
    }
  });
});

describe('getPhaseForWeek', () => {
  test('week 1 is Foundation', () => {
    expect(getPhaseForWeek(1).name).toBe('Foundation');
  });

  test('week 8 (last of Foundation)', () => {
    expect(getPhaseForWeek(8).name).toBe('Foundation');
  });

  test('week 9 (first of Craft)', () => {
    expect(getPhaseForWeek(9).name).toBe('Craft');
  });

  test('week 20 (last of Craft)', () => {
    expect(getPhaseForWeek(20).name).toBe('Craft');
  });

  test('week 21 (first of Range)', () => {
    expect(getPhaseForWeek(21).name).toBe('Range');
  });

  test('week 36 (last of Range)', () => {
    expect(getPhaseForWeek(36).name).toBe('Range');
  });

  test('week 37 (first of Refinement)', () => {
    expect(getPhaseForWeek(37).name).toBe('Refinement');
  });

  test('week 52 (last of Refinement)', () => {
    expect(getPhaseForWeek(52).name).toBe('Refinement');
  });
});

describe('getExerciseForWeek', () => {
  test('exercise index wraps within phase', () => {
    // Foundation: weeks 1-8, exercises 0-7
    const ex1 = getExerciseForWeek(1); // index 0
    const ex8 = getExerciseForWeek(8); // index 7
    expect(ex1).toBe(phases[0].exercises[0]);
    expect(ex8).toBe(phases[0].exercises[7]);
  });

  test('Craft phase exercises start from index 0', () => {
    // Craft: weeks 9-20, exercise index = (week - 9) % 8
    const ex9 = getExerciseForWeek(9); // index 0
    expect(ex9).toBe(phases[1].exercises[0]);
  });

  test('exercises cycle after 8 weeks in a phase', () => {
    // Craft has 12 weeks (9-20), so weeks 17-20 repeat exercises 0-3
    const ex17 = getExerciseForWeek(17); // (17-9)%8 = 0
    expect(ex17).toBe(phases[1].exercises[0]);
  });
});
