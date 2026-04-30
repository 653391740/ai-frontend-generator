import mimoClient from '../mimoClient.js';

const SYSTEM_PROMPT = `You are a Vue 3 code validation and optimization agent.
Given generated files and requirements, return a JSON validation report:
{
  "isValid": true,
  "score": 0-100,
  "suggestions": ["suggestion 1", "suggestion 2"],
  "optimizedCode": null
}

Check for:
- Completeness (all required components present)
- Vue 3 best practices (<script setup>, defineProps, etc.)
- Accessibility (aria attributes, semantic HTML)
- Responsive design (CSS media queries or flexible layouts)
- Performance (v-key on v-for, lazy loading where appropriate)

Set optimizedCode to a files array only if you made meaningful improvements, otherwise null.
Respond ONLY with valid JSON, no markdown fences.`;

/**
 * Validate and optionally optimise generated code.
 * @param {{ files: Array<{ name: string, content: string, language: string }> }} generatedCode
 * @param {object} requirements
 * @returns {Promise<{ isValid: boolean, score: number, suggestions: string[], optimizedCode: object|null }>}
 */
async function validate(generatedCode, requirements) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Validate the following Vue 3 code against requirements:\n\nFiles:\n${JSON.stringify(generatedCode, null, 2)}\n\nRequirements:\n${JSON.stringify(requirements, null, 2)}`,
    },
  ];

  const raw = await mimoClient.chat(messages, { temperature: 0.2, max_tokens: 2048 });

  try {
    return JSON.parse(extractJson(raw));
  } catch {
    throw new Error(`ValidationAgent: failed to parse response as JSON.\nRaw: ${raw.slice(0, 300)}`);
  }
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

export default { validate };
