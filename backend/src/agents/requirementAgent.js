import mimoClient from '../mimoClient.js';

const SYSTEM_PROMPT = `You are a requirement analysis agent for a UI generator.

Given a natural language description, extract and return a structured JSON object with:
- title: string (short app title)
- description: string (one sentence summary)
- pages: string[] (list of page names)
- features: string[] (key features)
- targetPlatform: "vue" | "uniapp"
- colorScheme: { primary, secondary, background, text } (hex colors)
- components: string[] (top-level component names)

Respond ONLY with valid JSON, no markdown fences.`;

/**
 * Analyze user input and return structured requirements.
 * @param {string} userInput
 * @returns {Promise<object>}
 */
async function analyze(userInput) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Analyze the following requirement and return structured JSON:\n\n${userInput}` },
  ];

  const raw = await mimoClient.chat(messages, { temperature: 0.3, max_tokens: 1024 });

  try {
    return JSON.parse(extractJson(raw));
  } catch {
    throw new Error(`RequirementAgent: failed to parse response as JSON.\nRaw: ${raw.slice(0, 300)}`);
  }
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

export default { analyze };
