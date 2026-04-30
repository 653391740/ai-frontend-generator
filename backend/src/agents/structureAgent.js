import mimoClient from '../mimoClient.js';

const SYSTEM_PROMPT = `You are a UI page structure design agent.
Given a requirements object, return a JSON page structure with:
- layout: "default" | "sidebar" | "centered"
- sections: Array of { id, type, title, components }
  - type: "header" | "hero" | "content" | "sidebar" | "footer" | "modal"
  - components: string[] (component names in this section)
- navigation: { type: "top" | "side" | "bottom", items: string[] }

Respond ONLY with valid JSON, no markdown fences.`;

/**
 * Design a page structure from structured requirements.
 * @param {object} requirements
 * @returns {Promise<object>}
 */
async function design(requirements) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Design the page structure for these requirements:\n\n${JSON.stringify(requirements, null, 2)}`,
    },
  ];

  const raw = await mimoClient.chat(messages, { temperature: 0.4, max_tokens: 1024 });

  try {
    return JSON.parse(extractJson(raw));
  } catch {
    throw new Error(`StructureAgent: failed to parse response as JSON.\nRaw: ${raw.slice(0, 300)}`);
  }
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

export default { design };
