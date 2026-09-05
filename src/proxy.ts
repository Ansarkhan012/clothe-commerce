import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';


export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.redirect(new URL('/admin-login?error=configuration', request.url));
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

    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        return NextResponse.redirect(new URL('/admin-login', request.url));
      }

      const { data: profile, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (roleError || profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin-login?error=forbidden', request.url));
      }
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.redirect(new URL('/admin-login?error=authentication', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
