import { getUserState } from '@/lib/queries';
import { phases } from '@/lib/program-content';
import { PlanView } from './plan-view';

export default function PlanPage() {
  const state = getUserState();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Your 52-week plan</h1>
      <PlanView phases={phases} currentPhaseId={state.current_phase} />
    </div>
  );
}
