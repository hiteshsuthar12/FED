import { useState } from 'react'
import './App.css'
import ProductCard from './component/productCard'

function App() {
  return (
    <div>
      <h1>My Shop</h1>

      <ProductCard name="phone" price={15000} image="download.jpeg"></ProductCard>
      <ProductCard name="phone" price={40000} image="download.webp"></ProductCard>
      <ProductCard name="Laptop" price={150000} image="shopping.webp"></ProductCard>
    </div>
  );
}
export default App
