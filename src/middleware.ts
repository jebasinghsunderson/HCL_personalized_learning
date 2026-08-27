import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Skip public routes entirely
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learning-path/:path*",
    "/skills/:path*",
    "/resources/:path*",
    "/assessments/:path*",
    "/progress/:path*",
    "/profile/:path*",
    "/assistant/:path*",
    "/onboarding/:path*",
  ]
}
