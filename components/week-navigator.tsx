'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { navigateWeek } from '@/actions/week-actions';

export function WeekNavigator({ weekNumber }: { weekNumber: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function goTo(week: number) {
    startTransition(() => {
      navigateWeek(week);
    });
    router.push(`/this-week?week=${week}`);
  }

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => goTo(weekNumber - 1)}
        disabled={weekNumber <= 1}
        className="min-h-[44px] min-w-[44px] rounded-lg px-3 py-2 text-sm font-medium text-ink-light transition-colors hover:bg-accent-light/40 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Previous week"
      >
        ← Prev
      </button>
      <h1 className="text-xl font-semibold">Week {weekNumber}</h1>
      <button
        onClick={() => goTo(weekNumber + 1)}
        disabled={weekNumber >= 52}
        className="min-h-[44px] min-w-[44px] rounded-lg px-3 py-2 text-sm font-medium text-ink-light transition-colors hover:bg-accent-light/40 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Next week"
      >
        Next →
      </button>
    </div>
  );
}
