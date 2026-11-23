import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 미로그인 요청 차단: API는 401, 페이지는 로그인 모달 페이지(/sign-in)로 rewrite.
// rewrite하므로 원래 페이지는 렌더링·전송되지 않고, 주소는 그대로 유지된다.
export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const { userId } = await auth();
  const isSignInPage =
    pathname === "/sign-in" || pathname.startsWith("/sign-in/");

  // 이미 로그인한 사용자가 /sign-in에 오면 대시보드로 보낸다.
  if (userId) {
    return isSignInPage
      ? NextResponse.redirect(new URL("/dashboard", req.url))
      : undefined;
  }
  // OAuth 콜백(/sign-in/sso-callback 등)도 통과시켜야 Clerk가 로그인을 마무리할 수 있다.
  if (isSignInPage) return;

  if (pathname.startsWith("/api")) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 },
    );
  }
  return NextResponse.rewrite(new URL("/sign-in", req.url));
});

export const config = {
  matcher: [
    // Next 내부 경로와 정적 파일은 제외
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
