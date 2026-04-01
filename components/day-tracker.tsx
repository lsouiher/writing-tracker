'use client';

import { toggleDay } from '@/actions/week-actions';
import { useTransition } from 'react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function DayTracker({
  weekNumber,
  markedDays,
}: {
  weekNumber: number;
  markedDays: number[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(dayIndex: number) {
    startTransition(() => {
      toggleDay(weekNumber, dayIndex);
    });
  }

  return (
    <div className="flex gap-2">
      {DAY_LABELS.map((label, index) => {
        const isMarked = markedDays.includes(index);
        return (
          <button
            key={index}
            onClick={() => handleToggle(index)}
            disabled={isPending}
            className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              isMarked
                ? 'bg-accent text-paper'
                : 'bg-accent-light/40 text-ink-light hover:bg-accent-light'
            }`}
            aria-pressed={isMarked}
            aria-label={`${label}${isMarked ? ' (written)' : ''}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
