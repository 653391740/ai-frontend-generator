<template>
  <div class="app" :class="{ dark: isDark }">
    <header class="app-header">
      <div class="header-brand">
        <span class="brand-icon">⚡</span>
        <h1 class="brand-name">AI Frontend Generator</h1>
        <span class="brand-badge">Multi-Agent</span>
      </div>
      <button class="theme-toggle" @click="isDark = !isDark" :title="isDark ? 'Light mode' : 'Dark mode'">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </header>
    <main class="app-main">
      <div class="left-panel">
        <InputPanel />
        <AgentPipeline />
      </div>
      <div class="right-panel">
        <CodeOutput />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InputPanel from './components/InputPanel.vue'
import AgentPipeline from './components/AgentPipeline.vue'
import CodeOutput from './components/CodeOutput.vue'

const isDark = ref(false)
</script>

<style>
/* Reset & base */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border: #e2e8f0;
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --accent-light: #eef2ff;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.08);
  --radius: 12px;
  --radius-sm: 8px;
  --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}

.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #0f172a;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border: #334155;
  --accent: #818cf8;
  --accent-hover: #6366f1;
  --accent-light: #1e1b4b;
  --shadow: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.3);
}

body {
  font-family: var(--font);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background 0.3s, color 0.3s;
  min-height: 100vh;
}

.app { min-height: 100vh; display: flex; flex-direction: column; }

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-brand { display: flex; align-items: center; gap: 10px; }
.brand-icon { font-size: 24px; }
.brand-name { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.brand-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  background: var(--accent-light);
  color: var(--accent);
  border-radius: 20px;
  border: 1px solid var(--accent);
}

.theme-toggle {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}
.theme-toggle:hover { background: var(--border); }

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 0;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid var(--border);
  background: var(--bg-secondary);
}

.right-panel {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

@media (max-width: 768px) {
  .app-main { grid-template-columns: 1fr; height: auto; }
  .left-panel { border-right: none; border-bottom: 1px solid var(--border); }
}
</style>
