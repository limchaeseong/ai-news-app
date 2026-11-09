"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

// 미로그인 상태에서 접속하면 로그인 모달을 자동으로 연다.
// 로그인이 끝나면 전체 새로고침해서 서버가 인증된 요청으로 다시 렌더링하게 한다.
export function SignInGate() {
  const { openSignIn, loaded } = useClerk();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!loaded) return;
    if (isSignedIn) {
      // 서버가 세션을 인식하지 못하면(예: CLERK_SECRET_KEY 오류) 무한 새로고침이 되므로 1회만 시도한다.
      try {
        if (sessionStorage.getItem("signin-reload")) return;
        sessionStorage.setItem("signin-reload", "1");
      } catch {}
      const { pathname, search } = window.location;
      window.location.replace(pathname.startsWith("/sign-in") ? "/" : pathname + search);
    } else {
      // 로그아웃 상태가 되면 다음 로그인 때 다시 1회 새로고침할 수 있도록 표시를 지운다.
      try {
        sessionStorage.removeItem("signin-reload");
      } catch {}
      openSignIn({});
    }
  }, [loaded, isSignedIn, openSignIn]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">AI News Collector</h1>
      {isSignedIn ? (
        <p className="text-zinc-500">이동 중... 화면이 바뀌지 않으면 서버의 Clerk 설정을 확인하세요.</p>
      ) : (
        <>
          <p className="text-zinc-500">로그인이 필요합니다.</p>
          <button
            type="button"
            onClick={() => openSignIn({})}
            className="rounded-md bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            로그인
          </button>
        </>
      )}
    </main>
  );
}
