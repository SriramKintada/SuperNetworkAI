import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: sessionData } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionData?.user) {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', sessionData.user.id)
        .single()

      // If no profile or onboarding not completed, redirect to onboarding
      if (!profile || !profile.onboarding_completed) {
        return NextResponse.redirect(requestUrl.origin + '/onboarding')
      }
    }
  }

  // For existing users with completed profiles, redirect to dashboard
  return NextResponse.redirect(requestUrl.origin + '/dashboard')
}
