import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ✅ "proxy" function export karo, "middleware" nahi
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase not configured, skip auth check
  if (!url || !key) {
    console.warn('Supabase not configured, skipping auth proxy');
    return response;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (request.nextUrl.pathname.startsWith('/admin-portal')) {
      if (!user) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      const ADMIN_EMAIL = 'ansarkhan.admin@gmail.com';
      if (user.email !== ADMIN_EMAIL) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } catch (error) {
    console.error('Proxy error:', error);
  }

  return response;
}

export const config = {
  matcher: ['/admin-portal/:path*'],
};