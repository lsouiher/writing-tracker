'use client';

import { useTransition } from 'react';
import { updateSkillRating } from '@/actions/skill-actions';

const RATING_LABELS = ['—', 'beginner', 'learning', 'developing', 'confident', 'strong'];

const SKILL_NAMES: Record<string, string> = {
  sentence_variety: 'Sentence variety',
  paragraph_structure: 'Paragraph structure',
  voice_tone: 'Voice & tone',
  storytelling: 'Storytelling',
  business_writing: 'Business writing',
  editing_revision: 'Editing / revision',
};

export function SkillRow({
  skillKey,
  rating,
}: {
  skillKey: string;
  rating: number;
}) {
  const [isPending, startTransition] = useTransition();
  const name = SKILL_NAMES[skillKey] ?? skillKey;

  function handlePipClick(pipValue: number) {
    const newRating = pipValue === rating ? 0 : pipValue;
    startTransition(() => {
      updateSkillRating(skillKey, newRating);
    });
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-ink-light">{RATING_LABELS[rating]}</div>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((pip) => (
          <button
            key={pip}
            onClick={() => handlePipClick(pip)}
            disabled={isPending}
            className={`h-7 w-7 rounded transition-colors ${
              pip <= rating
                ? 'bg-accent'
                : 'bg-accent-light/40 hover:bg-accent-light'
            }`}
            aria-label={`${name}: set to ${RATING_LABELS[pip]}`}
          />
        ))}
      </div>
    </div>
  );
}
