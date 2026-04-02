import { getUserState, getAllWeekLogs } from '@/lib/queries';
import { phases } from '@/lib/program-content';
import { WeekGrid } from '@/components/week-grid';

export default function LogPage() {
  const state = getUserState();
  const allLogs = getAllWeekLogs();

  const weekData = new Map<number, number>();
  let totalDays = 0;
  let weeksActive = 0;
  const recentNotes: { week: number; notes: string }[] = [];

  for (const log of allLogs) {
    let days: number[];
    try { days = JSON.parse(log.days); } catch { days = []; }
    weekData.set(log.week_number, days.length);
    totalDays += days.length;
    if (days.length > 0) weeksActive++;
    if (log.notes.trim()) {
      recentNotes.push({ week: log.week_number, notes: log.notes });
    }
  }

  const lastFiveNotes = recentNotes.slice(-5).reverse();
  const currentPhase = phases[state.current_phase] ?? phases[0];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-2xl font-semibold">Progress</h1>
        <WeekGrid weekData={weekData} currentWeek={state.current_week} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Weeks Active" value={weeksActive} />
          <Stat label="Total Days Written" value={totalDays} />
          <Stat label="Current Phase" value={currentPhase.name} />
          <Stat label="Current Week" value={state.current_week} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent notes</h2>
        {lastFiveNotes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-accent-light p-4 text-center text-sm text-ink-light">
            No notes yet. Write your first reflection on the This Week tab.
          </p>
        ) : (
          <div className="space-y-2">
            {lastFiveNotes.map(({ week, notes }) => (
              <div
                key={week}
                className="rounded-lg border border-accent-light p-3"
              >
                <div className="mb-1 text-xs font-medium text-ink-light">
                  Week {week}
                </div>
                <p className="line-clamp-2 text-sm">{notes}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-accent-light/20 p-3">
      <div className="text-xs text-ink-light">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
