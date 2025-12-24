// Example usage of Supabase clients in your Next.js app

// 1. Client-side usage (in components)
import { createClient } from './client'

export function useSupabaseClient() {
  const supabase = createClient()
  
  // Example: Fetch data
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
    
    if (error) {
      console.error('Error:', error)
      return null
    }
    
    return data
  }
  
  // Example: Authentication
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    return { data, error }
  }
  
  return { supabase, fetchData, signIn }
}

// 2. Server-side usage (in API routes, Server Components)
import { cookies } from 'next/headers'
import { createClient as createServerClient } from './server'

export async function getServerSideData() {
  const cookieStore = await cookies()
  const supabase = await createServerClient(cookieStore)

  const { data, error } = await supabase
    .from('your_table')
    .select('*')
  
  if (error) {
    console.error('Server error:', error)
    return null
  }
  
  return data
}

// 3. Middleware usage (in middleware.ts)
import { type NextRequest } from 'next/server'
import { createClient as createMiddlewareClient } from './middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    // Redirect to login if not authenticated
    return Response.redirect(new URL('/login', request.url))
  }
  
  return response
}