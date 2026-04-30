<template>
  <div class="input-panel">
    <div class="panel-header">
      <h2 class="panel-title">📝 Describe Your Page</h2>
    </div>

    <textarea
      v-model="store.userInput"
      class="input-textarea"
      :placeholder="placeholder"
      :disabled="store.isGenerating"
      rows="6"
    ></textarea>

    <div class="examples">
      <span class="examples-label">Try:</span>
      <button
        v-for="ex in examples"
        :key="ex"
        class="example-btn"
        @click="store.userInput = ex"
        :disabled="store.isGenerating"
      >{{ ex }}</button>
    </div>

    <div class="platform-selector">
      <label class="selector-label">Target Platform:</label>
      <div class="selector-options">
        <button
          class="platform-btn"
          :class="{ active: store.platform === 'vue' }"
          @click="store.platform = 'vue'"
          :disabled="store.isGenerating"
        >
          <span>🖥</span> Vue 3
        </button>
        <button
          class="platform-btn"
          :class="{ active: store.platform === 'uniapp' }"
          @click="store.platform = 'uniapp'"
          :disabled="store.isGenerating"
        >
          <span>📱</span> Uniapp
        </button>
      </div>
    </div>

    <div v-if="store.error" class="error-msg">
      ⚠️ {{ store.error }}
    </div>

    <button
      class="generate-btn"
      :disabled="store.isGenerating || !store.userInput.trim()"
      @click="handleGenerate"
    >
      <span v-if="store.isGenerating" class="spinner"></span>
      <span v-else>⚡</span>
      {{ store.isGenerating ? 'Generating...' : 'Generate Code' }}
    </button>

    <button
      v-if="store.generatedFiles.length > 0 && !store.isGenerating"
      class="reset-btn"
      @click="store.reset()"
    >
      🔄 Start Over
    </button>
  </div>
</template>

<script setup>
import { useGeneratorStore } from '../stores/generator'

const store = useGeneratorStore()

const placeholder = `Describe the page you want to create...

Examples:
• A modern todo app with categories and filters
• An e-commerce product listing page
• A user dashboard with charts and statistics`

const examples = [
  'A todo app with categories',
  'E-commerce product page',
  'User dashboard with stats',
]

function handleGenerate() {
  store.generate()
}
</script>

<style scoped>
.input-panel {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-header { display: flex; align-items: center; justify-content: space-between; }
.panel-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }

.input-textarea {
  width: 100%;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px;
  font-family: var(--font);
  font-size: 14px;
  color: var(--text-primary);
  resize: vertical;
  line-height: 1.6;
  transition: border-color 0.2s;
  outline: none;
}
.input-textarea:focus { border-color: var(--accent); }
.input-textarea:disabled { opacity: 0.6; cursor: not-allowed; }

.examples { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.examples-label { font-size: 12px; color: var(--text-muted); }
.example-btn {
  font-size: 11px;
  padding: 4px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.example-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
.example-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.platform-selector { display: flex; flex-direction: column; gap: 8px; }
.selector-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.selector-options { display: flex; gap: 8px; }
.platform-btn {
  flex: 1;
  padding: 8px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.platform-btn.active { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
.platform-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.error-msg {
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  color: var(--error);
  font-size: 13px;
}

.generate-btn {
  width: 100%;
  padding: 12px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  position: relative;
}
.generate-btn:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.4); }
.generate-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.reset-btn {
  width: 100%;
  padding: 8px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.reset-btn:hover { background: var(--bg-tertiary); }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
