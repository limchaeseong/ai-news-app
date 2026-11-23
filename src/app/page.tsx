import { redirect } from "next/navigation";

// 첫 화면은 /dashboard. (미로그인 요청은 proxy가 먼저 /sign-in으로 보낸다.)
export default function Home() {
  redirect("/dashboard");
}
