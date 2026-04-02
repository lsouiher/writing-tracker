export type Phase = {
  id: number;
  name: string;
  weekRange: [number, number];
  focus: string;
  weeklyGoal: string;
  skillTags: string[];
  exercises: string[];
  friendPrompt: string;
};

export type Book = {
  title: string;
  author: string;
  description: string;
};

export const phases: Phase[] = [
  {
    id: 0,
    name: 'Foundation',
    weekRange: [1, 8],
    focus: 'Build the writing habit and understand English prose rhythm.',
    weeklyGoal: 'Write 3 times per week, 15–30 minutes per session.',
    skillTags: ['Habit building', 'Prose rhythm', 'Sensory detail', 'Translation'],
    exercises: [
      'Expand one journal entry into a 300-word polished piece',
      'Copy a paragraph from a favorite book by hand — study the rhythm',
      'Rewrite the same scene in 3 different tones (formal, casual, poetic)',
      'Write a moment from your day using only concrete sensory details',
      'Read aloud everything you write — hear where it stumbles',
      'Translate an idea from your mother tongue, then rewrite it to sound natural in English',
      'Describe a person you know in exactly 100 words',
      'Write a 200-word intro to an imagined business blog post',
    ],
    friendPrompt:
      'Share one piece per week. Ask: Does this sound natural? Where does the rhythm break?',
  },
  {
    id: 1,
    name: 'Craft',
    weekRange: [9, 20],
    focus: 'Develop voice, narrative flow, and genre awareness.',
    weeklyGoal: 'Write 4 times per week; one longer piece (500–800 words) per week.',
    skillTags: ['Voice', 'Narrative flow', 'Genre awareness', 'Editing'],
    exercises: [
      'Write a scene opening 5 different ways — pick the best',
      'Take a blog post you admire and outline its structure',
      'Write a 600-word personal story with a clear beginning, middle, and end',
      'Rewrite a flat sentence 5 ways — each more vivid',
      'Write a business blog intro that hooks in the first sentence',
      "Study one author's style for a week — imitate their sentence length patterns",
      'Write a biography paragraph about someone you know',
      'Cut a 400-word piece down to 250 without losing meaning',
    ],
    friendPrompt:
      'Bring two pieces. Ask: Which voice feels more like me? What is the strongest sentence?',
  },
  {
    id: 2,
    name: 'Range',
    weekRange: [21, 36],
    focus: 'Write across target genres — stories, business blogs, biography.',
    weeklyGoal: 'One complete piece per week in a rotating genre.',
    skillTags: ['Genre range', 'Long-form', 'Peer review', 'Outlining'],
    exercises: [
      'Write a 1,000-word short story with a single protagonist and one turning point',
      'Draft a 3-part business blog series on a topic you know well',
      'Write a biographical sketch of a family member (800 words)',
      'Workshop an old piece — rewrite it from scratch after 2 weeks away',
      'Write the same event from two different points of view',
      'Create an outline for a longer project (biography chapter or blog series)',
      'Peer-review a piece your friend wrote — articulate what works',
      'Write with a strict time limit: 25 minutes, no stopping',
    ],
    friendPrompt:
      'Share a full-length piece. Discuss: structure, pacing, strongest and weakest section.',
  },
  {
    id: 3,
    name: 'Refinement',
    weekRange: [37, 52],
    focus: 'Polish work to publishable quality and begin a sustained real project.',
    weeklyGoal:
      'Work on one sustained project; publish or share at least one piece publicly.',
    skillTags: ['Publishing', 'Revision', 'Style', 'Sustained project'],
    exercises: [
      'Start a real blog or Substack — publish monthly',
      'Write and fully revise a short story (1,500–2,000 words)',
      'Draft the opening chapter of your biography',
      'Submit a piece to a community, forum, or publication',
      'Build a style sheet — your personal rules for your own writing',
      'Do a full line-edit of a piece written in Phase 1 — see how far you have come',
      'Write a piece you would be proud to show a stranger',
      'Plan your next year of writing',
    ],
    friendPrompt:
      'Discuss your project. Ask: Is this ready to share with the world? What is still missing?',
  },
];

export const readingList: Book[] = [
  {
    title: 'On Writing',
    author: 'Stephen King',
    description: 'Voice, process, and story — essential',
  },
  {
    title: 'Bird by Bird',
    author: 'Anne Lamott',
    description: 'Permission to write badly first',
  },
  {
    title: 'The Elements of Style',
    author: 'Strunk & White',
    description: 'Classic English prose rules',
  },
  {
    title: 'Several Short Sentences About Writing',
    author: 'Verlyn Klinkenborg',
    description: 'The power of the short sentence',
  },
  {
    title: 'Writing to Learn',
    author: 'William Zinsser',
    description: 'Clarity and non-fiction craft',
  },
];

export function getPhaseForWeek(weekNumber: number): Phase {
  const phase = phases.find(
    (p) => weekNumber >= p.weekRange[0] && weekNumber <= p.weekRange[1]
  );
  if (!phase) {
    throw new Error(`No phase found for week ${weekNumber}`);
  }
  return phase;
}

export function getExerciseForWeek(weekNumber: number): string {
  const phase = getPhaseForWeek(weekNumber);
  const index = (weekNumber - phase.weekRange[0]) % 8;
  return phase.exercises[index]!;
}
