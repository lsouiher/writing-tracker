import { getSkillRatings } from '@/lib/queries';
import { readingList } from '@/lib/program-content';
import { SkillRow } from '@/components/skill-row';

export default function SkillsPage() {
  const skills = getSkillRatings();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-1 text-2xl font-semibold">Skills</h1>
        <p className="text-sm text-ink-light">
          Rate yourself honestly. Revisit every 4–6 weeks.
        </p>

        <div className="mt-4 divide-y divide-accent-light/50">
          {skills.map((skill) => (
            <SkillRow
              key={skill.skill_key}
              skillKey={skill.skill_key}
              rating={skill.rating}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Reading list</h2>
        <div className="space-y-3">
          {readingList.map((book) => (
            <div key={book.title} className="rounded-lg border border-accent-light p-3">
              <div className="text-sm font-medium">{book.title}</div>
              <div className="text-xs text-ink-light">{book.author}</div>
              <div className="mt-1 text-xs text-ink-light">{book.description}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
