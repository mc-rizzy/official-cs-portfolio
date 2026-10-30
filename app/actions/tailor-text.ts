// app/actions/tailor-text.ts
'use server';

import { generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { directReplaceSchema } from './schema';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function generateTextReplacements(
  jobDescriptionText: string,
  myProjects: Array<{ title: string; description: string }>,
  myInterests: string
) {
  const { object } = await generateObject({
    model: groq('openai/gpt-oss-20b'), //fast lightweight
    // openai/gpt-oss-120b for heavier reasoning

    schema: directReplaceSchema,
    system: `You are an expert career consultant. Your task is to rephrase the candidate's project descriptions and profile copy to align naturally with the target job description using relevant technical keywords, methodologies, and phrasing from the listing. Never invent false achievements or fake technologies.`,
    prompt: `
      TARGET JOB DESCRIPTION:
      """
      ${jobDescriptionText}
      """

      MY CURRENT INTERESTS:
      """
      ${myInterests}
      """

      MY PROJECTS TO TAILOR:
      ${JSON.stringify(myProjects, null, 2)}
    `,
  });

  return object;
}