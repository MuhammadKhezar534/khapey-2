import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Add debugging to the middleware to see if it's affecting the sales route
  console.log("Middleware processing route");

  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/verify-otp";

  // Check if the user is authenticated by looking for a user item in localStorage
  // Note: In a real app, you would use a secure HTTP-only cookie instead
  const isAuthenticated = request.cookies.has("auth-session");

  // If the path is a public path and the user is authenticated, redirect to dashboard
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If the path is not a public path and the user is not authenticated, redirect to login
  if (!isPublicPath && !isAuthenticated && path !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except for:
    // - api routes
    // - static files (images, js, css, etc.)
    // - favicon.ico
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
