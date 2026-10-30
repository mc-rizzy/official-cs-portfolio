// app/actions/schema.ts
import { z } from 'zod';

export const directReplaceSchema = z.object({
  locations: z.string().describe("Formatted as: 'City, State, Country' or 'Remote, USA'"),
  skills: z.array(z.string()).describe("Short tech stack or soft skills matching JD (e.g. ['REST', 'SQL', 'C++'])"),
  oneLinerTitle: z.string().describe("A concise 1-line headline matching the target job title and domain focus."),
  rephrasedInterests: z.string().describe("2-3 sentences tying current interests directly to the company's domain."),
  rephrasedProjects: z.array(
    z.object({
      originalTitle: z.string().describe("The exact original project title passed in."),
      tailoredDescription: z.string().describe(
        "Rephrased description incorporating relevant technical keywords, tools, and terminology from the job description while keeping the core accomplishments truthful."
      ),
    })
  ).describe("Rephrased descriptions for EVERY project provided in the input list, in the exact same order."),
});

export type DirectReplacements = z.infer<typeof directReplaceSchema>;