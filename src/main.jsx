import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import './styles/game-theme.css'
import { setProjects } from './data/projects.js'
import { fetchPublishedProjects } from './data/projectsApi.js'

// Apply persisted theme before first paint (light = default)
try {
  document.documentElement.dataset.theme = localStorage.getItem('hni_theme') || 'light'
} catch {
  document.documentElement.dataset.theme = 'light'
}

function render() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

// Hydrate the admin-managed project catalogue from the backend before the first
// render. If the backend is unreachable (e.g. offline build), the game silently
// falls back to the bundled default projects. A short timeout keeps boot snappy.
async function boot() {
  try {
    const withTimeout = Promise.race([
      fetchPublishedProjects(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
    ])
    const list = await withTimeout
    setProjects(list)
  } catch (e) {
    console.warn('[projects] backend unavailable — using bundled defaults:', e.message)
  }
  render()
}

boot()
