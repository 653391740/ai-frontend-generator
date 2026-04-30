import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import orchestrator from './orchestrator.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasMimoKey: !!(process.env.MIMO_API_KEY && process.env.MIMO_API_KEY !== 'your_api_key_here'),
      model: process.env.MIMO_MODEL || 'mimo-7b',
      baseUrl: process.env.MIMO_API_BASE_URL || 'https://api.mimo.ai/v1',
    },
  });
});

// ── Generate Endpoint (SSE) ───────────────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  const { prompt, platform } = req.body ?? {};

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Build the final input, incorporating the target platform if supplied
  const userInput = platform && platform !== 'vue'
    ? `${prompt} (target platform: ${platform})`
    : prompt;

  const agentMessages = {
    requirementAgent: { running: 'Analyzing requirements…', complete: 'Requirements analyzed' },
    structureAgent:   { running: 'Designing page structure…', complete: 'Structure designed' },
    componentAgent:   { running: 'Planning components…', complete: 'Components planned' },
    codeAgent:        { running: 'Generating Vue code…', complete: 'Code generated' },
    validationAgent:  { running: 'Validating & optimizing…', complete: 'Validation complete' },
  };

  try {
    const result = await orchestrator.run(userInput, ({ agent, status, data, progress }) => {
      const message = agentMessages[agent]?.[status] ?? `${agent}: ${status}`;
      send({
        type: 'progress',
        agent,
        status,
        message,
        progress,
        data,
      });
    });

    send({
      type: 'complete',
      progress: 100,
      result: {
        files: result.files,
        validation: result.validation,
        requirements: result.requirements,
      },
    });
  } catch (err) {
    send({
      type: 'error',
      message: err.message || 'An unexpected error occurred',
    });
  } finally {
    res.end();
  }
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`AI Frontend Generator backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
