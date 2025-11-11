import { useLocalStorage } from './useLocalStorage';
import { products as initialProducts } from '../data/products';
import type { Product } from '../types';

export function useProducts() {
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);

  const addProduct = (product: Product) => {
    // Basic validation to prevent adding a product with a duplicate ID
    if (products.some(p => p.id === product.id)) {
        alert(`Product with SKU/ID "${product.id}" already exists.`);
        return;
    }
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  return { products, setProducts, addProduct, updateProduct, deleteProduct };
}
