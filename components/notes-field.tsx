'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { saveNotes } from '@/actions/week-actions';

export function NotesField({
  weekNumber,
  initialNotes,
}: {
  weekNumber: number;
  initialNotes: string;
}) {
  const [value, setValue] = useState(initialNotes);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const weekRef = useRef(weekNumber);

  useEffect(() => {
    setValue(initialNotes);
    weekRef.current = weekNumber;
  }, [weekNumber, initialNotes]);

  const save = useCallback(
    (text: string) => {
      saveNotes(weekRef.current, text);
    },
    []
  );

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    setValue(text);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(text), 1000);
  }

  function handleBlur() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    save(value);
  }

  return (
    <textarea
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="What did you write this week? What felt hard or easy? Any feedback from your friend?"
      aria-label="Weekly notes"
      className="w-full rounded-lg border border-accent-light bg-paper p-3 text-sm leading-relaxed text-ink placeholder:text-ink-light/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      rows={5}
    />
  );
}
