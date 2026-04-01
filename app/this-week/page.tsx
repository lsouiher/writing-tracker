import { getUserState, getWeekLog } from '@/lib/queries';
import { getPhaseForWeek, getExerciseForWeek } from '@/lib/program-content';
import { DayTracker } from '@/components/day-tracker';
import { ProgressMessage } from '@/components/progress-message';
import { NotesField } from '@/components/notes-field';
import { WeekNavigator } from '@/components/week-navigator';

export default function ThisWeekPage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const state = getUserState();
  const viewedWeek = searchParams.week
    ? Math.max(1, Math.min(52, parseInt(searchParams.week, 10) || state.current_week))
    : state.current_week;

  const weekLog = getWeekLog(viewedWeek);
  const markedDays: number[] = weekLog ? JSON.parse(weekLog.days) : [];
  const notes = weekLog?.notes ?? '';

  const phase = getPhaseForWeek(viewedWeek);
  const exercise = getExerciseForWeek(viewedWeek);

  return (
    <div className="space-y-6">
      <WeekNavigator weekNumber={viewedWeek} />

      <div className="text-sm text-ink-light">
        {phase.name} — Week {viewedWeek}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Days written</h2>
        <DayTracker weekNumber={viewedWeek} markedDays={markedDays} />
        <ProgressMessage daysCount={markedDays.length} />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Exercise of the week</h2>
        <p className="rounded-lg bg-accent-light/30 p-4 text-sm leading-relaxed">
          {exercise}
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Notes</h2>
        <NotesField weekNumber={viewedWeek} initialNotes={notes} />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Friend session prompt</h2>
        <p className="rounded-lg border border-accent-light p-4 text-sm italic leading-relaxed text-ink-light">
          {phase.friendPrompt}
        </p>
      </section>
    </div>
  );
}
