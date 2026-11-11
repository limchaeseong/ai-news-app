import Anthropic from "@anthropic-ai/sdk";

// 번역·요약·분류는 가볍고 빠른 모델로 충분하다.
export const NEWS_MODEL = "claude-haiku-5-5";

let client: Anthropic | null = null;

/** 첫 호출 때 생성한다(빌드 시점에 ANTHROPIC_API_KEY가 없어도 import가 실패하지 않게). */
export function getAnthropic(): Anthropic {
  client ??= new Anthropic();
  return client;
}
