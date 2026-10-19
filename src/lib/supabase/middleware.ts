import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseKey, normalizeSupabaseUrl } from "./env";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/unauthorized"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabaseKey()?.trim();
  const url = rawUrl ? normalizeSupabaseUrl(rawUrl) : "";

  if (!url || !key) {
    if (!isPublicPath(request.nextUrl.pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (user && pathname === "/login") {
      const home = request.nextUrl.clone();
      home.pathname = "/";
      return NextResponse.redirect(home);
    }
    return supabaseResponse;
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_superadmin) {
    const denied = request.nextUrl.clone();
    denied.pathname = "/unauthorized";
    return NextResponse.redirect(denied);
  }

  return supabaseResponse;
}
