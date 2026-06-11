import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import './styles/game-theme.css'

// Apply persisted theme before first paint (dark = default game look)
try {
  document.documentElement.dataset.theme = localStorage.getItem('hni_theme') || 'dark'
} catch {
  document.documentElement.dataset.theme = 'dark'
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
