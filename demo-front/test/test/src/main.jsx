import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Testnet from './components/Testnet.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   { /* <App/> */}
    <Testnet></Testnet>
  </StrictMode>,
)
