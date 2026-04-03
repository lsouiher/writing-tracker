/**
 * Manual Supabase database types derived from migrations.
 * Regenerate with: npx supabase gen types typescript --local > src/types/database.ts
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          country: string | null
          language: 'fr' | 'en'
          role: 'student' | 'team_admin' | 'admin'
          referral_code: string
          referred_by: string | null
          email_opt_out: boolean | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'referral_code' | 'created_at' | 'updated_at'> & {
          referral_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      courses: {
        Row: {
          id: string
          slug: string
          title: string
          title_en: string | null
          description: string
          description_en: string | null
          level: 'beginner' | 'intermediate' | 'advanced'
          duration_minutes: number
          thumbnail_url: string
          is_published: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['courses']['Row']>
      }
      modules: {
        Row: {
          id: string
          course_id: string
          slug: string
          title: string
          description: string
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['modules']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['modules']['Row']>
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          slug: string
          title: string
          description: string
          video_id: string
          duration_seconds: number
          transcript_fr: string
          transcript_en: string | null
          transcript: string | null
          subtitle_url_fr: string
          subtitle_url_en: string | null
          is_free_preview: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['lessons']['Row']>
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
        }
        Insert: Omit<Database['public']['Tables']['enrollments']['Row'], 'id' | 'enrolled_at'> & {
          id?: string
          enrolled_at?: string
        }
        Update: Partial<Database['public']['Tables']['enrollments']['Row']>
      }
      progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          last_position_seconds: number
          watched_seconds: number
          completed_at: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['progress']['Row'], 'id' | 'updated_at'> & {
          id?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['progress']['Row']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          plan: 'monthly' | 'annual'
          status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired'
          currency: 'eur' | 'cad' | 'usd'
          price_region: 'default' | 'maghreb' | 'west_africa' | 'canada'
          trial_ends_at: string | null
          current_period_end: string
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_percent: number
          max_uses: number
          current_uses: number
          expires_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'current_uses' | 'created_at'> & {
          id?: string
          current_uses?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['coupons']['Row']>
      }
      quizzes: {
        Row: {
          id: string
          module_id: string
          title: string
          passing_score: number
          questions: unknown
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quizzes']['Row'], 'id' | 'passing_score' | 'created_at'> & {
          id?: string
          passing_score?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['quizzes']['Row']>
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          passed: boolean
          answers: unknown
          completed_at: string
        }
        Insert: Omit<Database['public']['Tables']['quiz_results']['Row'], 'id' | 'completed_at'> & {
          id?: string
          completed_at?: string
        }
        Update: Partial<Database['public']['Tables']['quiz_results']['Row']>
      }
      labs: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string
          language: string
          starter_code: string
          test_cases: unknown
          solution: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['labs']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['labs']['Row']>
      }
      lab_submissions: {
        Row: {
          id: string
          user_id: string
          lab_id: string
          code: string
          passed: boolean
          output: string
          submitted_at: string
        }
        Insert: Omit<Database['public']['Tables']['lab_submissions']['Row'], 'id' | 'submitted_at'> & {
          id?: string
          submitted_at?: string
        }
        Update: Partial<Database['public']['Tables']['lab_submissions']['Row']>
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          verification_code: string
          pdf_url: string
          issued_at: string
        }
        Insert: Omit<Database['public']['Tables']['certificates']['Row'], 'id' | 'issued_at'> & {
          id?: string
          issued_at?: string
        }
        Update: Partial<Database['public']['Tables']['certificates']['Row']>
      }
      capstone_submissions: {
        Row: {
          id: string
          user_id: string
          course_id: string
          title: string
          description: string
          repository_url: string | null
          submitted_code: string | null
          ai_score: number | null
          ai_feedback: string | null
          status: string
          peer_review_open: boolean
          submitted_at: string
          graded_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['capstone_submissions']['Row'], 'id' | 'status' | 'peer_review_open' | 'submitted_at'> & {
          id?: string
          status?: string
          peer_review_open?: boolean
          submitted_at?: string
        }
        Update: Partial<Database['public']['Tables']['capstone_submissions']['Row']>
      }
      capstone_reviews: {
        Row: {
          id: string
          submission_id: string
          reviewer_id: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['capstone_reviews']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['capstone_reviews']['Row']>
      }
      community_posts: {
        Row: {
          id: string
          course_id: string
          author_id: string | null
          parent_id: string | null
          title: string | null
          body: string
          upvote_count: number
          reply_count: number
          is_flagged: boolean
          is_removed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['community_posts']['Row'], 'id' | 'upvote_count' | 'reply_count' | 'is_flagged' | 'is_removed' | 'created_at' | 'updated_at'> & {
          id?: string
          upvote_count?: number
          reply_count?: number
          is_flagged?: boolean
          is_removed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['community_posts']['Row']>
      }
      post_votes: {
        Row: {
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['post_votes']['Row'], 'created_at'> & {
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['post_votes']['Row']>
      }
      moderation_flags: {
        Row: {
          id: string
          post_id: string
          reason: string
          reviewed: boolean
          reviewed_by: string | null
          decision: string | null
          created_at: string
          reviewed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['moderation_flags']['Row'], 'id' | 'reviewed' | 'created_at'> & {
          id?: string
          reviewed?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['moderation_flags']['Row']>
      }
      team_licenses: {
        Row: {
          id: string
          admin_id: string
          stripe_subscription_id: string
          seat_count: number
          seats_used: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_licenses']['Row'], 'id' | 'seats_used' | 'status' | 'created_at' | 'updated_at'> & {
          id?: string
          seats_used?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['team_licenses']['Row']>
      }
      team_members: {
        Row: {
          id: string
          team_license_id: string
          user_id: string
          invited_email: string
          accepted_at: string | null
          removed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['team_members']['Row']>
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referee_id: string
          status: string
          reward_applied: boolean
          created_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['referrals']['Row'], 'id' | 'status' | 'reward_applied' | 'created_at'> & {
          id?: string
          status?: string
          reward_applied?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['referrals']['Row']>
      }
      ai_tutor_logs: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          question: string
          answer: string
          was_off_topic: boolean
          tokens_used: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ai_tutor_logs']['Row'], 'id' | 'was_off_topic' | 'created_at'> & {
          id?: string
          was_off_topic?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['ai_tutor_logs']['Row']>
      }
    }
  }
}
