import { z } from "zod";

export const resultItemSchema = z.object({
  idx: z.number().int(),
  titleKo: z.string().trim().min(1),
  summaryKo: z.string().trim().min(1),
  category: z.string().nullable(),
});

export const resultSchema = z.object({
  results: z.array(resultItemSchema),
});

export type ResultItem = z.infer<typeof resultItemSchema>;

/** Claude에 넘기는 JSON Schema. 카테고리는 사용자 카테고리 이름 enum 또는 null(미분류). */
export function buildJsonSchema(categoryNames: string[]) {
  return {
    type: "object",
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          properties: {
            idx: { type: "integer" },
            titleKo: { type: "string" },
            summaryKo: { type: "string" },
            category: {
              anyOf: [
                { type: "string", enum: categoryNames },
                { type: "null" },
              ],
            },
          },
          required: ["idx", "titleKo", "summaryKo", "category"],
          additionalProperties: false,
        },
      },
    },
    required: ["results"],
    additionalProperties: false,
  } as const;
}
