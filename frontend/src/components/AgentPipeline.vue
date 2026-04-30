<template>
  <div class="pipeline-panel">
    <div class="panel-header">
      <h2 class="panel-title">🤖 Agent Pipeline</h2>
      <span v-if="store.isGenerating" class="overall-progress">
        {{ overallProgress }}%
      </span>
    </div>

    <div class="agents-list">
      <div
        v-for="(agent, idx) in store.agents"
        :key="agent.id"
        class="agent-item"
        :class="agent.status"
      >
        <div class="agent-connector" v-if="idx > 0" :class="{ active: agent.status !== 'idle' }"></div>
        <div class="agent-card">
          <div class="agent-icon">{{ agentIcons[agent.id] }}</div>
          <div class="agent-info">
            <div class="agent-name">{{ agent.name }}</div>
            <div class="agent-message">{{ agent.message || agentDescriptions[agent.id] }}</div>
            <div v-if="agent.status === 'running' && agent.progress > 0" class="agent-progress-bar">
              <div class="agent-progress-fill" :style="{ width: agent.progress + '%' }"></div>
            </div>
          </div>
          <div class="agent-status-badge" :class="agent.status">
            <span v-if="agent.status === 'running'" class="pulse"></span>
            {{ statusLabels[agent.status] }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.generatedFiles.length > 0" class="output-summary">
      ✅ Generated {{ store.generatedFiles.length }} files successfully
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGeneratorStore } from '../stores/generator'

const store = useGeneratorStore()

const agentIcons = {
  requirementAgent: '📋',
  structureAgent: '🏗️',
  componentAgent: '🧩',
  codeAgent: '💻',
  validationAgent: '✅'
}

const agentDescriptions = {
  requirementAgent: 'Analyzes natural language requirements',
  structureAgent: 'Designs page layout and structure',
  componentAgent: 'Plans Vue component hierarchy',
  codeAgent: 'Generates Vue 3 / Uniapp code',
  validationAgent: 'Validates and optimizes output'
}

const statusLabels = {
  idle: 'Waiting',
  running: 'Running',
  complete: 'Done',
  error: 'Error'
}

const overallProgress = computed(() => {
  const total = store.agents.reduce((sum, a) => sum + (a.progress || 0), 0)
  return Math.round(total / store.agents.length)
})
</script>

<style scoped>
.pipeline-panel {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 20px;
}

.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.panel-title { font-size: 15px; font-weight: 600; }
.overall-progress { font-size: 13px; font-weight: 600; color: var(--accent); background: var(--accent-light); padding: 2px 10px; border-radius: 20px; }

.agents-list { display: flex; flex-direction: column; }

.agent-connector {
  height: 16px;
  width: 2px;
  background: var(--border);
  margin: 0 auto 0 22px;
  transition: background 0.3s;
}
.agent-connector.active { background: var(--accent); }

.agent-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  transition: all 0.3s;
}

.agent-item.running .agent-card {
  border-color: var(--accent);
  background: var(--accent-light);
  box-shadow: 0 0 0 2px rgba(99,102,241,0.1);
}

.agent-item.complete .agent-card { border-color: var(--success); }
.agent-item.error .agent-card { border-color: var(--error); }

.agent-icon { font-size: 22px; width: 36px; text-align: center; flex-shrink: 0; }

.agent-info { flex: 1; min-width: 0; }
.agent-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.agent-message { font-size: 11px; color: var(--text-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.agent-progress-bar {
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
}
.agent-progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.agent-status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-muted);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.agent-status-badge.running { background: var(--accent); color: white; border-color: var(--accent); }
.agent-status-badge.complete { background: var(--success); color: white; border-color: var(--success); }
.agent-status-badge.error { background: var(--error); color: white; border-color: var(--error); }

.pulse {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.output-summary {
  margin-top: 14px;
  padding: 10px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-sm);
  color: #15803d;
  font-size: 13px;
  font-weight: 500;
}
</style>
