import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Parent from './components/parent.jsx'
import Parent2 from './components/parent2.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   {/* { <App /> } */}
   <Parent></Parent>
   <Parent2></Parent2>
     </StrictMode>,
)
 