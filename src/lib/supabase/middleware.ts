import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
    });
    throw new Error('Your project\'s URL and Key are required to create a Supabase client!');
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }: CookieToSet) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it so the user
  // is never authenticated.

  // Extract user from auth cookie by decoding JWT
  const allCookies = request.cookies.getAll();
  const authCookie = allCookies.find(c => c.name.includes('auth-token'));
  
  let user: { id: string; email: string; role: string } | null = null;
  
  if (authCookie?.value) {
    try {
      const sessionFromCookie = JSON.parse(authCookie.value);
      
      if (sessionFromCookie.access_token) {
        // Decode JWT payload (base64) to get user info
        const parts = sessionFromCookie.access_token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          
          // Check if token is not expired
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp > now) {
            user = {
              id: payload.sub,
              email: payload.email,
              role: payload.role,
            };
          }
        }
      }
    } catch {
      // Invalid cookie format, user remains null
    }
  }

  // Rediriger vers login si non authentifié
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse;
}

