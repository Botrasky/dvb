import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const writeups = defineCollection({
  loader: glob({ pattern: "*_Report.md", base: "./writeups" }),
  schema: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    summary: z.string().optional(),
    topic: z.string().optional(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
    platform: z.string().optional(),
    cover: z.string().optional(),
    date: z.coerce.date().optional(),
    status: z.string().optional(),
  }),
});

export const collections = { writeups };
