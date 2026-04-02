export function ProgressMessage({ daysCount }: { daysCount: number }) {
  let message: string;
  let color: string;

  if (daysCount >= 4) {
    message = 'great week';
    color = 'text-accent';
  } else if (daysCount >= 2) {
    message = 'keep going';
    color = 'text-ink-light';
  } else {
    message = 'get writing';
    color = 'text-ink-light';
  }

  return (
    <p className={`mt-3 text-sm font-medium ${color}`}>
      {daysCount} day{daysCount !== 1 ? 's' : ''} this week — {message}
    </p>
  );
}
