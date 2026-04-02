'use client';

import { useState } from 'react';
import { PhaseCard } from '@/components/phase-card';
import type { Phase } from '@/lib/program-content';

export function PlanView({
  phases,
  currentPhaseId,
}: {
  phases: Phase[];
  currentPhaseId: number;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {phases.map((phase) => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          isCurrent={phase.id === currentPhaseId}
          isExpanded={expandedId === phase.id}
          onExpand={() =>
            setExpandedId((prev) => (prev === phase.id ? null : phase.id))
          }
        />
      ))}
    </div>
  );
}
