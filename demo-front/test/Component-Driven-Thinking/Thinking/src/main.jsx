import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ProductCard from './component/productCard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <ProductCard></ProductCard>
  </StrictMode>,
)
