import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export { default } from 'next-auth/middleware';
export const config = {
  matcher: ["/create", "/admin/dashboard", "/copilot", "/dashboard", "/profile", "/tasks"],
};

export async function middleware(req) {
  console.log('Middleware is running for:', req.nextUrl.pathname);
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const signInUrl = new URL('/', req.nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', encodeURIComponent(req.nextUrl.pathname));
    return NextResponse.redirect(signInUrl.toString());
  }

  return NextResponse.next();
}