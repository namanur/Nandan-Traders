import React, { useState } from 'react';
import type { Product, CartItem } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (item: CartItem) => void;
  cartItem?: CartItem;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, cartItem }) => {
  const [quantity, setQuantity] = useState(cartItem?.qty || 1);

  const handleAddToCart = () => {
    onAddToCart({ ...product, qty: quantity });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-lg">
      <img className="h-48 w-full object-cover" src={product.image} alt={product.name} />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">SKU: {product.id}</p>
        <div className="mt-auto">
          <p className="text-xl font-bold text-gray-900">₹{product.rate.toFixed(2)} <span className="text-base font-normal text-gray-500">/ {product.unit}</span></p>
          <div className="flex items-center mt-3 gap-2">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 p-2 border border-gray-300 rounded-md text-center"
            />
            <button
              onClick={handleAddToCart}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {cartItem ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
