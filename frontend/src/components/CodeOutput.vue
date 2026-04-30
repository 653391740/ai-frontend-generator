<template>
  <div class="code-output">
    <!-- Empty State -->
    <div v-if="store.generatedFiles.length === 0" class="empty-state">
      <div class="empty-icon">⚡</div>
      <h3 class="empty-title">Ready to Generate</h3>
      <p class="empty-desc">
        Describe your page on the left and click<br>
        <strong>Generate Code</strong> to start.
      </p>
      <div class="empty-pipeline">
        <div v-for="step in pipelineSteps" :key="step" class="pipeline-step">
          <span>{{ step }}</span>
        </div>
      </div>
    </div>

    <!-- Code Display -->
    <template v-else>
      <!-- File Tabs -->
      <div class="file-tabs">
        <button
          v-for="file in store.generatedFiles"
          :key="file.name"
          class="file-tab"
          :class="{ active: store.activeFile === file.name }"
          @click="store.setActiveFile(file.name)"
        >
          <span class="file-icon">{{ getFileIcon(file.name) }}</span>
          {{ file.name }}
        </button>
        <div class="tabs-actions">
          <button class="action-btn" @click="copyCurrentFile" :title="'Copy ' + store.activeFile">
            {{ copied ? '✅' : '📋' }}
          </button>
        </div>
      </div>

      <!-- File Meta -->
      <div v-if="activeFileData" class="file-meta">
        <span class="meta-name">{{ activeFileData.name }}</span>
        <span class="meta-lines">{{ lineCount }} lines</span>
        <span class="meta-lang">{{ activeFileData.language }}</span>
      </div>

      <!-- Code Content -->
      <div class="code-container">
        <pre class="code-pre"><code v-html="highlightedCode"></code></pre>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGeneratorStore } from '../stores/generator'

const store = useGeneratorStore()
const copied = ref(false)

const pipelineSteps = [
  '1️⃣ Requirement Analysis',
  '2️⃣ Structure Design',
  '3️⃣ Component Planning',
  '4️⃣ Code Generation',
  '5️⃣ Validation & Optimization'
]

const activeFileData = computed(() =>
  store.generatedFiles.find(f => f.name === store.activeFile)
)

const lineCount = computed(() => {
  if (!activeFileData.value) return 0
  return activeFileData.value.content.split('\n').length
})

function getFileIcon(name) {
  if (name.endsWith('.vue')) return '💚'
  if (name.endsWith('.ts') || name.endsWith('.js')) return '💛'
  if (name.endsWith('.css')) return '💙'
  if (name.endsWith('.json')) return '🟠'
  return '📄'
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function simpleHighlight(code, lang) {
  let highlighted = escapeHtml(code)

  if (lang === 'vue' || lang === 'html') {
    // Tags
    highlighted = highlighted.replace(/(&lt;\/?)([\w-]+)/g, '<span class="hl-tag">$1$2</span>')
    // Attributes
    highlighted = highlighted.replace(/\s([\w-:@.]+)=/g, ' <span class="hl-attr">$1</span>=')
    // Strings
    highlighted = highlighted.replace(/"([^"]*)"/g, '"<span class="hl-string">$1</span>"')
  }

  // Comments
  highlighted = highlighted.replace(/(\/\/[^\n]*)/g, '<span class="hl-comment">$1</span>')
  highlighted = highlighted.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="hl-comment">$1</span>')

  // Keywords
  const keywords = ['const', 'let', 'var', 'function', 'return', 'import', 'export', 'default', 'from', 'ref', 'computed', 'reactive', 'defineProps', 'defineEmits', 'setup', 'async', 'await', 'if', 'else', 'for', 'in', 'of']
  keywords.forEach(kw => {
    highlighted = highlighted.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span class="hl-keyword">$1</span>')
  })

  return highlighted
}

const highlightedCode = computed(() => {
  if (!activeFileData.value) return ''
  return simpleHighlight(activeFileData.value.content, activeFileData.value.language)
})

async function copyCurrentFile() {
  if (!activeFileData.value) return
  await navigator.clipboard.writeText(activeFileData.value.content)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.code-output {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-secondary);
  padding: 40px;
}
.empty-icon { font-size: 56px; opacity: 0.5; }
.empty-title { font-size: 20px; font-weight: 600; color: var(--text-primary); }
.empty-desc { text-align: center; line-height: 1.7; font-size: 14px; }

.empty-pipeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  padding: 16px 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  min-width: 240px;
}
.pipeline-step { font-size: 13px; color: var(--text-secondary); padding: 4px 0; }

.file-tabs {
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  flex-shrink: 0;
  align-items: center;
}
.file-tabs::-webkit-scrollbar { height: 3px; }
.file-tabs::-webkit-scrollbar-thumb { background: var(--border); }

.file-tab {
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}
.file-tab:hover { color: var(--text-primary); background: var(--bg-tertiary); }
.file-tab.active { color: var(--accent); border-bottom-color: var(--accent); background: var(--bg-primary); }

.file-icon { font-size: 14px; }

.tabs-actions { margin-left: auto; padding: 0 8px; }
.action-btn {
  padding: 6px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.action-btn:hover { background: var(--border); }

.file-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  flex-shrink: 0;
}
.meta-name { font-weight: 600; color: var(--text-primary); }
.meta-lines, .meta-lang { color: var(--text-muted); }
.meta-lang {
  background: var(--bg-tertiary);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.code-container {
  flex: 1;
  overflow: auto;
  background: var(--bg-tertiary);
}

.code-pre {
  padding: 20px;
  margin: 0;
  font-family: var(--mono);
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-primary);
  min-height: 100%;
  white-space: pre;
  tab-size: 2;
}

/* Syntax highlighting */
:deep(.hl-tag) { color: #e879f9; }
:deep(.hl-attr) { color: #60a5fa; }
:deep(.hl-string) { color: #34d399; }
:deep(.hl-keyword) { color: #818cf8; font-weight: 600; }
:deep(.hl-comment) { color: #6b7280; font-style: italic; }
</style>
