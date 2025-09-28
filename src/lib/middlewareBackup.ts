// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { publicRoutes } from "@/lib/routeConfig";
import { supabaseAdmin } from "@/lib/supabaseAdmin.server";
export async function middleware(request: NextRequest) {
  // Create a response object that will be used to set cookies.
  let response = NextResponse.next({ request });

  // Create a Supabase client configured to read and update cookies.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: cookiesToSet => {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set cookies on the response object
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This is the crucial step: refreshing the session.
  // Calling getUser() will read the tokens, refresh them if needed,
  // and set the new tokens on the `response` object through the `setAll` callback.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  // console.log(pathname);
  // Public routes are always allowed.
  if (publicRoutes.includes(pathname)) {
    return response;
  }

  console.log(user);

  // If the user is not found, redirect to the login page.
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // If the user is authenticated, continue to the protected page with the updated response.
  return response;
}

// Apply middleware to all routes except the specified ones.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
