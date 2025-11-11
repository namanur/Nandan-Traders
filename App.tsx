import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { sendOrder } from './services/api';
import type { Product, CartItem, Order, PendingOrder } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProducts } from './hooks/useProducts';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import { ShoppingCartIcon, RefreshIcon, DownloadIcon, CheckCircleIcon, ExclamationCircleIcon } from './components/Icons';
import { businessInfo } from './data/businessInfo';

type ToastMessage = {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
};

const App: React.FC = () => {
  const { products } = useProducts();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cartItems', []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useLocalStorage<PendingOrder[]>('pendingOrders', []);
  const [completedOrders, setCompletedOrders] = useLocalStorage<Order[]>('completedOrders', []);
  const [isRetrying, setIsRetrying] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  // Effect to simulate loading products
  useEffect(() => {
    setIsLoading(true);
    // Simulate network delay for better UX, even with local data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  const processPendingOrders = useCallback(async () => {
    if (isRetrying || pendingOrders.length === 0 || !navigator.onLine) return;
    setIsRetrying(true);
    addToast('info', `Retrying ${pendingOrders.length} pending order(s)...`);

    const results = await Promise.all(
        pendingOrders.map(async (pOrder) => {
            const res = await sendOrder(pOrder.order);
            return { success: res.ok, orderId: pOrder.order.orderId, order: pOrder.order };
        })
    );

    const successfulOrders = results.filter(r => r.success);
    const failedOrderIds = new Set(results.filter(r => !r.success).map(r => r.orderId));

    if (successfulOrders.length > 0) {
        setCompletedOrders(prev => [...prev, ...successfulOrders.map(r => r.order)]);
        addToast('success', `${successfulOrders.length} order(s) sent successfully.`);
    }

    setPendingOrders(prev => prev.filter(p => failedOrderIds.has(p.order.orderId)).map(p => ({
        ...p,
        attemptCount: p.attemptCount + 1,
        lastAttempt: new Date().toISOString()
    })));
    
    setIsRetrying(false);
  }, [pendingOrders, setPendingOrders, setCompletedOrders, addToast, isRetrying]);

  useEffect(() => {
    if (pendingOrders.length > 0 && navigator.onLine) {
      const timer = setTimeout(processPendingOrders, 2000); // Retry on page load after a delay
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on initial mount

  useEffect(() => {
    window.addEventListener('online', processPendingOrders);
    return () => {
      window.removeEventListener('online', processPendingOrders);
    };
  }, [processPendingOrders]);


  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  const cartTotalItems = useMemo(() => cartItems.reduce((sum, item) => sum + item.qty, 0), [cartItems]);

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => i.id === item.id ? { ...i, qty: item.qty } : i);
      }
      return [...prev, item];
    });
    addToast('info', `${item.name} added to cart.`);
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    setCartItems(prev => prev.map(item => item.id === productId ? { ...item, qty: qty > 0 ? qty : 1 } : item));
  };
  
  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };
  
  const handlePlaceOrder = async (customerDetails: Omit<Order, 'orderId' | 'timestamp' | 'items' | 'grandTotal'>) => {
    const now = new Date();
    const orderId = `NT-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    const grandTotal = cartItems.reduce((total, item) => total + item.rate * item.qty, 0);

    const newOrder: Order = {
      ...customerDetails,
      orderId,
      timestamp: now.toISOString(),
      items: cartItems,
      grandTotal,
    };

    const newPendingOrder: PendingOrder = {
        order: newOrder,
        attemptCount: 1,
        lastAttempt: new Date().toISOString()
    };
    
    // Add to local storage immediately
    setPendingOrders(prev => [...prev, newPendingOrder]);
    addToast('info', `Order ${newOrder.orderId} is being processed...`);
    setIsCartOpen(false);
    setCartItems([]);

    const result = await sendOrder(newOrder);

    if (result.ok) {
        setCompletedOrders(prev => [...prev, newOrder]);
        setPendingOrders(prev => prev.filter(p => p.order.orderId !== newOrder.orderId));
        addToast('success', `Order ${newOrder.orderId} placed successfully!`);
    } else {
        addToast('error', `Order ${newOrder.orderId} failed to send and is queued for retry.`);
    }
  };

  const handleDownloadCSV = () => {
    const allOrders = [...completedOrders, ...pendingOrders.map(p => p.order)];
    if(allOrders.length === 0) {
        addToast('info', 'No orders to export.');
        return;
    }

    const headers = ['Order ID', 'Timestamp', 'Name', 'Mobile', 'GST', 'Address', 'Grand Total', 'Items', 'Notes'];
    const csvContent = [
        headers.join(','),
        ...allOrders.map(order => [
            order.orderId,
            order.timestamp,
            `"${order.name}"`,
            order.mobile,
            order.gst || '',
            `"${order.address?.replace(/"/g, '""') || ''}"`,
            order.grandTotal,
            `"${order.items.map(i => `${i.name} (Qty: ${i.qty})`).join('; ')}"`,
            `"${order.notes?.replace(/"/g, '""') || ''}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `nandan_traders_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Orders exported successfully.');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-800">{businessInfo.businessName}</h1>
            <p className="text-gray-500">{businessInfo.tagline}</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-full w-48 md:w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartTotalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {cartTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
        <nav className="bg-gray-50 border-t border-b">
            <div className="container mx-auto px-4 flex justify-center space-x-2 py-2 overflow-x-auto">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                            selectedCategory === category
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </nav>
      </header>
      
      <main className="container mx-auto p-4 flex-grow">
        {pendingOrders.length > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-sm mb-6 flex justify-between items-center">
            <div>
              <p className="font-bold">Pending Orders</p>
              <p>{pendingOrders.length} order(s) could not be sent. They will be retried automatically.</p>
            </div>
            <button onClick={processPendingOrders} disabled={isRetrying} className="flex items-center px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 transition">
              <RefreshIcon className={`h-5 w-5 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry Now'}
            </button>
          </div>
        )}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-md"></div>
                    <div className="h-6 bg-gray-200 mt-4 rounded"></div>
                    <div className="h-4 bg-gray-200 mt-2 w-1/2 rounded"></div>
                    <div className="h-8 bg-gray-200 mt-4 rounded"></div>
                </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
                cartItem={cartItems.find(item => item.id === product.id)} 
              />
            ))}
          </div>
        )}
        {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-16">
                <h2 className="text-2xl font-semibold text-gray-700">No Products Found</h2>
                <p className="text-gray-500 mt-2">Try adjusting your search or filter.</p>
            </div>
        )}
      </main>

      <footer className="bg-gray-800 text-gray-300 mt-8 py-8">
          <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold text-white">{businessInfo.businessName}</h3>
                      <p className="italic text-gray-400">{businessInfo.tagline}</p>
                      <p className="mt-2 text-sm">GSTIN: {businessInfo.gstin}</p>
                      <p className="text-sm"><strong>Proprietor:</strong> {businessInfo.owner}</p>
                      <div className="mt-4 space-y-1 text-sm">
                          <p>
                              📞 {businessInfo.contacts.join('  |  ')}
                          </p>
                          <p>
                              ✉️ <a href={`mailto:${businessInfo.email}`} className="hover:underline">{businessInfo.email}</a>
                          </p>
                          <p>
                              📍 {businessInfo.address}
                          </p>
                      </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end space-y-4">
                      <button onClick={handleDownloadCSV} className="flex items-center justify-center w-full max-w-xs px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
                          <DownloadIcon className="h-5 w-5 mr-2"/>
                          Download Orders (CSV)
                      </button>
                      <a href="/admin" className="text-blue-400 hover:underline">Admin Panel</a>
                  </div>
              </div>
              <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-500 text-sm">
                  <p>&copy; {new Date().getFullYear()} {businessInfo.businessName}. All rights reserved.</p>
              </div>
          </div>
      </footer>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onPlaceOrder={handlePlaceOrder}
      />
      
      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const bgColor = isSuccess ? 'bg-green-100 border-green-400' : isError ? 'bg-red-100 border-red-400' : 'bg-blue-100 border-blue-400';
          const textColor = isSuccess ? 'text-green-700' : isError ? 'text-red-700' : 'text-blue-700';

          return (
            <div key={toast.id} className={`p-4 rounded-lg shadow-lg border-l-4 ${bgColor} ${textColor} flex items-start space-x-3 animate-fade-in-up`}>
                <div>
                    {isSuccess && <CheckCircleIcon className="h-6 w-6" />}
                    {isError && <ExclamationCircleIcon className="h-6 w-6" />}
                    {toast.type === 'info' && <ExclamationCircleIcon className="h-6 w-6" />}
                </div>
                <p className="flex-1 text-sm font-medium">{toast.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;