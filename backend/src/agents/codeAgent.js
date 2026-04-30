import mimoClient from '../mimoClient.js';

const SYSTEM_PROMPT = `You are a Vue 3 code generation agent.
Given a component plan and requirements, generate complete Vue 3 Single File Components (SFCs).
Return a JSON object:
{
  "files": [
    {
      "name": "App.vue",
      "content": "<full .vue file content>",
      "language": "vue"
    }
  ]
}

Rules:
- Use <script setup> syntax (Composition API)
- Use scoped styles
- Components must be production-quality, responsive, and accessible
- Include all imports
- Respond ONLY with valid JSON, no markdown fences`;

/**
 * Generate Vue 3 SFC code from the component plan.
 * @param {object} componentPlan
 * @param {object} requirements
 * @param {object} structure
 * @returns {Promise<{ files: Array<{ name: string, content: string, language: string }> }>}
 */
async function generate(componentPlan, requirements, structure) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Generate Vue 3 SFC code for:\n\nComponent Plan:\n${JSON.stringify(componentPlan, null, 2)}\n\nRequirements:\n${JSON.stringify(requirements, null, 2)}\n\nStructure:\n${JSON.stringify(structure, null, 2)}`,
    },
  ];

  const raw = await mimoClient.chat(messages, { temperature: 0.5, max_tokens: 8192 });

  try {
    return JSON.parse(extractJson(raw));
  } catch {
    throw new Error(`CodeAgent: failed to parse response as JSON.\nRaw: ${raw.slice(0, 300)}`);
  }
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

export default { generate };
