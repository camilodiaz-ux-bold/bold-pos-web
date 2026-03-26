import './styles/reset.css'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/index.css'
import './app/pos.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
