-- T020: Seed data for development

-- Course 1: Beginner
insert into public.courses (id, slug, title, description, level, duration_minutes, is_published, sort_order, thumbnail_url)
values (
  '00000000-0000-0000-0000-000000000001',
  'fondamentaux-ia-business',
  'Les Fondamentaux de l''IA pour le Business',
  'Comprendre et utiliser l''intelligence artificielle dans votre activite professionnelle. Du prompting aux outils IA, en passant par l''automatisation.',
  'beginner',
  480,
  true,
  1,
  '/images/courses/fondamentaux-ia.jpg'
);

-- Module 1
insert into public.modules (id, course_id, slug, title, description, sort_order)
values (
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'comprendre-ia',
  'Comprendre l''IA',
  'Les bases de l''intelligence artificielle: histoire, concepts, et applications actuelles.',
  1
);

-- Lesson 1.1 (free preview)
insert into public.lessons (id, module_id, slug, title, description, video_id, duration_seconds, transcript_fr, subtitle_url_fr, is_free_preview, sort_order)
values (
  '00000000-0000-0000-0002-000000000001',
  '00000000-0000-0000-0001-000000000001',
  'introduction-intelligence-artificielle',
  'Introduction a l''Intelligence Artificielle',
  'Qu''est-ce que l''IA? Comment fonctionne-t-elle? Pourquoi est-elle importante pour votre carriere?',
  'BUNNY_VIDEO_ID_1',
  2700,
  'Bienvenue dans ce premier cours sur l''intelligence artificielle. Dans cette lecon, nous allons explorer les fondamentaux de l''IA...',
  '/subtitles/lesson-1-1-fr.vtt',
  true,
  1
);

-- Lesson 1.2
insert into public.lessons (id, module_id, slug, title, description, video_id, duration_seconds, transcript_fr, subtitle_url_fr, is_free_preview, sort_order)
values (
  '00000000-0000-0000-0002-000000000002',
  '00000000-0000-0000-0001-000000000001',
  'types-intelligence-artificielle',
  'Les Types d''Intelligence Artificielle',
  'IA faible vs IA forte, apprentissage supervise, non supervise, et par renforcement.',
  'BUNNY_VIDEO_ID_2',
  2400,
  'Il existe plusieurs types d''intelligence artificielle. Dans cette lecon, nous allons les decouvrir ensemble...',
  '/subtitles/lesson-1-2-fr.vtt',
  false,
  2
);

-- Module 2
insert into public.modules (id, course_id, slug, title, description, sort_order)
values (
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'maitriser-prompting',
  'Maitriser le Prompting',
  'L''art de communiquer avec les modeles d''IA pour obtenir des resultats optimaux.',
  2
);

-- Lesson 2.1 (free preview)
insert into public.lessons (id, module_id, slug, title, description, video_id, duration_seconds, transcript_fr, subtitle_url_fr, is_free_preview, sort_order)
values (
  '00000000-0000-0000-0002-000000000003',
  '00000000-0000-0000-0001-000000000002',
  'bases-prompting',
  'Les Bases du Prompting',
  'Comment formuler des instructions claires et efficaces pour les modeles d''IA.',
  'BUNNY_VIDEO_ID_3',
  2100,
  'Le prompting est l''art de formuler des instructions pour les modeles d''IA. C''est une competence essentielle...',
  '/subtitles/lesson-2-1-fr.vtt',
  true,
  1
);
