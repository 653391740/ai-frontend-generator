import axios from 'axios';
import 'dotenv/config';

const API_KEY = process.env.MIMO_API_KEY;
const API_BASE_URL = process.env.MIMO_API_BASE_URL || 'https://api.mimo.ai/v1';
const MODEL = process.env.MIMO_MODEL || 'mimo-7b';

const hasMimoKey = API_KEY && API_KEY !== 'your_api_key_here';

/**
 * Send a chat completion request to the MiMo API (OpenAI-compatible format).
 * @param {Array<{role: string, content: string}>} messages
 * @param {object} [options]
 * @returns {Promise<string>} assistant message content
 */
async function chat(messages, options = {}) {
  if (!hasMimoKey) {
    return mockChat(messages, options);
  }

  const response = await axios.post(
    `${API_BASE_URL}/chat/completions`,
    {
      model: options.model || MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4096,
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  return response.data.choices[0].message.content;
}

/**
 * Stream a chat completion request, invoking onChunk for each delta.
 * @param {Array<{role: string, content: string}>} messages
 * @param {(chunk: string) => void} onChunk
 * @param {object} [options]
 * @returns {Promise<string>} full accumulated response
 */
async function streamChat(messages, onChunk, options = {}) {
  if (!hasMimoKey) {
    const result = await mockChat(messages, options);
    // Simulate streaming by emitting in chunks
    const words = result.split(' ');
    let accumulated = '';
    for (const word of words) {
      const chunk = word + ' ';
      accumulated += chunk;
      onChunk(chunk);
      await new Promise((r) => setTimeout(r, 10));
    }
    return accumulated.trim();
  }

  const response = await axios.post(
    `${API_BASE_URL}/chat/completions`,
    {
      model: options.model || MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4096,
      stream: true,
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      responseType: 'stream',
      timeout: 120000,
    }
  );

  return new Promise((resolve, reject) => {
    let accumulated = '';
    let buffer = '';

    response.data.on('data', (raw) => {
      buffer += raw.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            accumulated += delta;
            onChunk(delta);
          }
        } catch {
          // ignore malformed SSE chunks
        }
      }
    });

    response.data.on('end', () => resolve(accumulated));
    response.data.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Mock implementation – generates realistic placeholder responses so the
// pipeline works end-to-end without a real API key.
// ---------------------------------------------------------------------------

function mockChat(messages, _options = {}) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  // Use the first line of the system prompt as a stable identifier for each agent
  const systemContent = messages.find((m) => m.role === 'system')?.content ?? '';
  const systemFirstLine = systemContent.split('\n')[0].toLowerCase();

  if (systemFirstLine.includes('requirement analysis')) {
    return Promise.resolve(JSON.stringify(mockRequirements(lastUser)));
  }
  if (systemFirstLine.includes('page structure')) {
    return Promise.resolve(JSON.stringify(mockStructure()));
  }
  if (systemFirstLine.includes('component plan')) {
    return Promise.resolve(JSON.stringify(mockComponentPlan()));
  }
  if (systemFirstLine.includes('code generation')) {
    return Promise.resolve(JSON.stringify(mockGeneratedCode(lastUser)));
  }
  if (systemFirstLine.includes('validat')) {
    return Promise.resolve(JSON.stringify(mockValidation()));
  }

  return Promise.resolve('Mock response: ' + lastUser.slice(0, 80));
}

function mockRequirements(input) {
  const title = deriveTitle(input);
  return {
    title,
    description: `A modern ${title} application with clean UI and smooth interactions.`,
    pages: ['Home', 'Main', 'Detail'],
    features: ['Responsive layout', 'Interactive components', 'State management', 'Clean design'],
    targetPlatform: input.toLowerCase().includes('uniapp') ? 'uniapp' : 'vue',
    colorScheme: { primary: '#4f46e5', secondary: '#7c3aed', background: '#f9fafb', text: '#111827' },
    components: ['AppHeader', 'AppFooter', 'MainContent', 'ActionButton'],
  };
}

function mockStructure() {
  return {
    layout: 'default',
    sections: [
      { id: 'header', type: 'header', title: 'App Header', components: ['AppHeader'] },
      { id: 'hero', type: 'hero', title: 'Hero Section', components: ['HeroSection'] },
      { id: 'content', type: 'content', title: 'Main Content', components: ['MainContent'] },
      { id: 'footer', type: 'footer', title: 'App Footer', components: ['AppFooter'] },
    ],
    navigation: { type: 'top', items: ['Home', 'Features', 'About'] },
  };
}

function mockComponentPlan() {
  return {
    components: [
      {
        name: 'AppHeader',
        props: ['title', 'navItems'],
        description: 'Top navigation bar with logo and nav links',
        template: 'header',
      },
      {
        name: 'HeroSection',
        props: ['headline', 'subtext', 'ctaLabel'],
        description: 'Full-width hero with CTA button',
        template: 'hero',
      },
      {
        name: 'MainContent',
        props: ['items'],
        description: 'Primary content area with item cards',
        template: 'content',
      },
      {
        name: 'AppFooter',
        props: ['year', 'brand'],
        description: 'Footer with copyright info',
        template: 'footer',
      },
    ],
  };
}

function mockGeneratedCode(input) {
  const title = deriveTitle(input);
  return {
    files: [
      { name: 'App.vue', content: generateAppVue(title), language: 'vue' },
      { name: 'components/AppHeader.vue', content: generateHeaderVue(title), language: 'vue' },
      { name: 'components/HeroSection.vue', content: generateHeroVue(title), language: 'vue' },
      { name: 'components/MainContent.vue', content: generateMainContentVue(title), language: 'vue' },
      { name: 'components/AppFooter.vue', content: generateFooterVue(title), language: 'vue' },
    ],
  };
}

function mockValidation() {
  return {
    isValid: true,
    score: 92,
    suggestions: [
      'Consider adding aria-label attributes for better accessibility.',
      'Add loading states for async operations.',
    ],
    optimizedCode: null, // no changes needed
  };
}

// ---------------------------------------------------------------------------
// Template helpers
// ---------------------------------------------------------------------------

function deriveTitle(input) {
  const lower = input.toLowerCase();
  if (lower.includes('todo') || lower.includes('task')) return 'Todo App';
  if (lower.includes('shop') || lower.includes('store') || lower.includes('ecommerce')) return 'Online Shop';
  if (lower.includes('blog')) return 'Blog';
  if (lower.includes('dashboard')) return 'Dashboard';
  if (lower.includes('portfolio')) return 'Portfolio';
  if (lower.includes('weather')) return 'Weather App';
  if (lower.includes('chat')) return 'Chat App';
  // Capitalise first meaningful word
  const words = input.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function generateAppVue(title) {
  return `<template>
  <div id="app">
    <AppHeader :title="appTitle" :nav-items="navItems" />
    <HeroSection
      :headline="hero.headline"
      :subtext="hero.subtext"
      :cta-label="hero.ctaLabel"
      @cta-click="handleCta"
    />
    <MainContent :items="contentItems" />
    <AppFooter :year="currentYear" :brand="appTitle" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppHeader from './components/AppHeader.vue'
import HeroSection from './components/HeroSection.vue'
import MainContent from './components/MainContent.vue'
import AppFooter from './components/AppFooter.vue'

const appTitle = '${title}'

const navItems = ref([
  { label: 'Home', href: '#' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
])

const hero = ref({
  headline: 'Welcome to ${title}',
  subtext: 'A modern, fast and intuitive application built with Vue 3.',
  ctaLabel: 'Get Started',
})

const contentItems = ref([
  { id: 1, title: 'Feature One', description: 'Powerful and easy to use.' },
  { id: 2, title: 'Feature Two', description: 'Beautiful and responsive design.' },
  { id: 3, title: 'Feature Three', description: 'Fast performance out of the box.' },
])

const currentYear = computed(() => new Date().getFullYear())

function handleCta() {
  console.log('CTA clicked')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #111827;
  background: #f9fafb;
  min-height: 100vh;
}
</style>
`;
}

function generateHeaderVue(title) {
  return `<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="logo">{{ title }}</div>
      <nav class="nav" aria-label="Main navigation">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          class="nav-link"
        >{{ item.label }}</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, default: '${title}' },
  navItems: { type: Array, default: () => [] },
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4f46e5;
}
.nav { display: flex; gap: 1.5rem; }
.nav-link {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition: color .2s;
}
.nav-link:hover { color: #4f46e5; }
</style>
`;
}

function generateHeroVue(_title) {
  return `<template>
  <section class="hero">
    <div class="hero-inner">
      <h1 class="hero-headline">{{ headline }}</h1>
      <p class="hero-subtext">{{ subtext }}</p>
      <button class="cta-btn" @click="$emit('cta-click')">{{ ctaLabel }}</button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  headline: { type: String, required: true },
  subtext: { type: String, default: '' },
  ctaLabel: { type: String, default: 'Get Started' },
})

defineEmits(['cta-click'])
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  padding: 6rem 1.5rem;
  text-align: center;
}
.hero-inner {
  max-width: 720px;
  margin: 0 auto;
}
.hero-headline {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.25rem;
}
.hero-subtext {
  font-size: 1.125rem;
  opacity: .85;
  margin-bottom: 2.5rem;
}
.cta-btn {
  background: #ffffff;
  color: #4f46e5;
  border: none;
  padding: .875rem 2.25rem;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
}
.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,.2);
}
</style>
`;
}

function generateMainContentVue(_title) {
  return `<template>
  <main class="main-content" id="features">
    <div class="content-inner">
      <h2 class="section-title">Features</h2>
      <div class="card-grid">
        <article
          v-for="item in items"
          :key="item.id"
          class="card"
        >
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-desc">{{ item.description }}</p>
        </article>
      </div>
    </div>
  </main>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<style scoped>
.main-content {
  padding: 5rem 1.5rem;
}
.content-inner {
  max-width: 1200px;
  margin: 0 auto;
}
.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #111827;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
.card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
  transition: transform .25s, box-shadow .25s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0,0,0,.12);
}
.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: .5rem;
  color: #4f46e5;
}
.card-desc { color: #6b7280; line-height: 1.6; }
</style>
`;
}

function generateFooterVue(_title) {
  return `<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <p class="copyright">&copy; {{ year }} {{ brand }}. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  year: { type: Number, default: 2024 },
  brand: { type: String, default: 'App' },
})
</script>

<style scoped>
.app-footer {
  background: #111827;
  color: #9ca3af;
  padding: 2rem 1.5rem;
  text-align: center;
}
.footer-inner { max-width: 1200px; margin: 0 auto; }
.copyright { font-size: .875rem; }
</style>
`;
}

export default { chat, streamChat };
