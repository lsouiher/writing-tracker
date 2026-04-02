'use client';

import { useState, useTransition } from 'react';
import { setCurrentPhase } from '@/actions/phase-actions';
import type { Phase } from '@/lib/program-content';

export function PhaseCard({
  phase,
  isCurrent,
  isExpanded: initialExpanded,
  onExpand,
}: {
  phase: Phase;
  isCurrent: boolean;
  isExpanded: boolean;
  onExpand: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    onExpand();
    if (!isCurrent) {
      startTransition(() => {
        setCurrentPhase(phase.id);
      });
    }
  }

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isCurrent ? 'border-accent bg-accent-light/20' : 'border-accent-light'
      }`}
    >
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex w-full items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent rounded-lg"
        aria-expanded={initialExpanded}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{phase.name}</h2>
            {isCurrent && (
              <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-paper">
                current
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-light">
            Weeks {phase.weekRange[0]}–{phase.weekRange[1]}
          </p>
          <p className="mt-1 text-sm text-ink-light">{phase.focus}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {phase.skillTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-light/50 px-2 py-0.5 text-xs text-ink-light"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <span className="ml-2 text-ink-light">{initialExpanded ? '▲' : '▼'}</span>
      </button>

      {initialExpanded && (
        <div className="border-t border-accent-light px-4 pb-4 pt-3">
          <p className="mb-3 text-sm font-medium">{phase.weeklyGoal}</p>

          <h3 className="mb-2 text-sm font-semibold">Exercises</h3>
          <ol className="mb-4 list-inside list-decimal space-y-1 text-sm text-ink-light">
            {phase.exercises.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ol>

          <h3 className="mb-1 text-sm font-semibold">Friend session prompt</h3>
          <p className="text-sm italic text-ink-light">{phase.friendPrompt}</p>
        </div>
      )}
    </div>
  );
}
