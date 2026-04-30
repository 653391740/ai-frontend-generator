import mimoClient from '../mimoClient.js';

const SYSTEM_PROMPT = `You are a Vue 3 component planning agent.
Given a page structure and requirements, return a JSON component plan:
{
  "components": [
    {
      "name": "ComponentName",
      "props": ["prop1", "prop2"],
      "emits": ["event1"],
      "description": "What this component does",
      "template": "header | hero | content | card | list | form | footer | modal"
    }
  ]
}

Respond ONLY with valid JSON, no markdown fences.`;

/**
 * Plan the component hierarchy from structure and requirements.
 * @param {object} structure
 * @param {object} requirements
 * @returns {Promise<object>}
 */
async function plan(structure, requirements) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Plan Vue 3 components for:\n\nStructure:\n${JSON.stringify(structure, null, 2)}\n\nRequirements:\n${JSON.stringify(requirements, null, 2)}`,
    },
  ];

  const raw = await mimoClient.chat(messages, { temperature: 0.4, max_tokens: 2048 });

  try {
    return JSON.parse(extractJson(raw));
  } catch {
    throw new Error(`ComponentAgent: failed to parse response as JSON.\nRaw: ${raw.slice(0, 300)}`);
  }
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

export default { plan };
