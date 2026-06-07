import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user) {
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    res.headers.set('X-Debug', 'no-user');
    return res;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError) {
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    res.headers.set('X-Debug', `profile-error: ${profileError.message}`);
    return res;
  }

  if (!profile?.is_admin) {
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    res.headers.set('X-Debug', `not-admin: is_admin=${profile?.is_admin}`);
    return res;
  }

  response.headers.set('X-Debug', 'access-granted');

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
