import type { SupabaseClient } from '@supabase/supabase-js'

export async function getLabByModule(supabase: SupabaseClient, moduleId: string) {
  const { data, error } = await supabase
    .from('labs')
    .select('*')
    .eq('module_id', moduleId)
    .single()

  if (error) return null
  return data
}

export async function saveLabSubmission(
  supabase: SupabaseClient,
  userId: string,
  labId: string,
  code: string,
  result: { passed: boolean; output: string }
) {
  const { data, error } = await supabase
    .from('lab_submissions')
    .insert({
      user_id: userId,
      lab_id: labId,
      code,
      passed: result.passed,
      output: result.output,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getLabSubmissions(supabase: SupabaseClient, userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('lab_submissions')
    .select(`
      *,
      lab:labs!inner(
        module:modules!inner(
          course_id
        )
      )
    `)
    .eq('user_id', userId)
    .eq('lab.module.course_id', courseId)
    .order('submitted_at', { ascending: false })

  if (error) return []
  return data
}
