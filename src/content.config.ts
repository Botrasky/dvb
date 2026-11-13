import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const writeups = defineCollection({
  loader: glob({ pattern: "*_Report.md", base: "./writeups" }),
  schema: z.object({
<<<<<<< HEAD
    title: z.string().optional(),
    slug: z.string().optional(),
    summary: z.string().optional(),
    topic: z.string().optional(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
    platform: z.string().optional(),
    cover: z.string().optional(),
    date: z.coerce.date().optional(),
    status: z.string().optional(),
=======
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    summary: z.string().min(1),
    topic: z.enum(["crypto", "pwn", "web", "re", "general", "misc"]),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    platform: z.string().min(1),
    cover: z.string().regex(/^\/assets\/writeup-covers\/[a-z0-9-]+\.svg$/),
    date: z.coerce.date(),
    status: z.enum(["draft", "published", "archived"]),
>>>>>>> origin/feat/astro-refactor-threat-feed
  }),
});

export const collections = { writeups };
