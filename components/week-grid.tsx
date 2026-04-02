import Link from 'next/link';

type WeekData = {
  week_number: number;
  daysCount: number;
};

function getShadingClass(daysCount: number): string {
  if (daysCount >= 5) return 'bg-accent';
  if (daysCount >= 3) return 'bg-accent/60';
  if (daysCount >= 1) return 'bg-accent/25';
  return 'bg-accent-light/30';
}

export function WeekGrid({
  weekData,
  currentWeek,
}: {
  weekData: Map<number, number>;
  currentWeek: number;
}) {
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-2">
      <div
        className="grid grid-cols-13 gap-1"
        style={{ minWidth: '340px' }}
        role="grid"
        aria-label="52-week progress grid"
      >
        {weeks.map((week) => {
          const daysCount = weekData.get(week) ?? 0;
          const isCurrent = week === currentWeek;

          return (
            <Link
              key={week}
              href={`/this-week?week=${week}`}
              className={`flex h-8 items-center justify-center rounded text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${getShadingClass(daysCount)} ${
                isCurrent ? 'ring-2 ring-accent ring-offset-1 ring-offset-paper' : ''
              } hover:ring-1 hover:ring-ink-light`}
              aria-label={`Week ${week}: ${daysCount} day${daysCount !== 1 ? 's' : ''}`}
            >
              {week}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
