import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useGeneratorStore = defineStore('generator', () => {
  const userInput = ref('')
  const platform = ref('vue')
  const isGenerating = ref(false)
  const generatedFiles = ref([])
  const activeFile = ref('')
  const error = ref('')

  const agents = reactive([
    { id: 'requirementAgent', name: 'Requirement Analyst', status: 'idle', progress: 0, message: '' },
    { id: 'structureAgent', name: 'Structure Designer', status: 'idle', progress: 0, message: '' },
    { id: 'componentAgent', name: 'Component Planner', status: 'idle', progress: 0, message: '' },
    { id: 'codeAgent', name: 'Code Generator', status: 'idle', progress: 0, message: '' },
    { id: 'validationAgent', name: 'Code Validator', status: 'idle', progress: 0, message: '' }
  ])

  function resetAgents() {
    agents.forEach(a => {
      a.status = 'idle'
      a.progress = 0
      a.message = ''
    })
  }

  function updateAgent(agentId, updates) {
    const agent = agents.find(a => a.id === agentId)
    if (agent) Object.assign(agent, updates)
  }

  function setActiveFile(filename) {
    activeFile.value = filename
  }

  function reset() {
    userInput.value = ''
    platform.value = 'vue'
    isGenerating.value = false
    generatedFiles.value = []
    activeFile.value = ''
    error.value = ''
    resetAgents()
  }

  async function generate() {
    if (!userInput.value.trim() || isGenerating.value) return

    isGenerating.value = true
    error.value = ''
    generatedFiles.value = []
    activeFile.value = ''
    resetAgents()

    try {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput.value, platform: platform.value })
      })

      if (!response.ok) throw new Error(`Server error: ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (!data || data === '[DONE]') continue

          try {
            const event = JSON.parse(data)
            handleEvent(event)
          } catch (e) {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      error.value = err.message || 'Failed to connect to the generator service. Make sure the backend is running on port 3000.'
    } finally {
      isGenerating.value = false
    }
  }

  function handleEvent(event) {
    if (event.type === 'progress' && event.agent) {
      updateAgent(event.agent, {
        status: event.status || 'running',
        progress: event.progress || 0,
        message: event.message || ''
      })
    } else if (event.type === 'complete' && event.result) {
      if (event.result.files) {
        generatedFiles.value = event.result.files
        if (event.result.files.length > 0) {
          activeFile.value = event.result.files[0].name
        }
      }
      agents.forEach(a => {
        if (a.status !== 'error') {
          a.status = 'complete'
          a.progress = 100
        }
      })
    } else if (event.type === 'error') {
      error.value = event.message || 'Generation failed'
    }
  }

  return {
    userInput, platform, isGenerating, agents, generatedFiles, activeFile, error,
    generate, reset, setActiveFile
  }
})
