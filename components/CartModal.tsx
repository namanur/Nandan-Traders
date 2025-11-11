import React, { useState, useMemo } from 'react';
import type { CartItem, Order } from '../types';
import { TrashIcon, XIcon } from './Icons';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: (customerDetails: Omit<Order, 'orderId' | 'timestamp' | 'items' | 'grandTotal'>) => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onPlaceOrder }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gst, setGst] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});

  const grandTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.rate * item.qty, 0);
  }, [cartItems]);

  const validate = () => {
    const newErrors: { name?: string; mobile?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit Indian mobile number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onPlaceOrder({ name, mobile, gst, address, notes });
      setName('');
      setMobile('');
      setGst('');
      setAddress('');
      setNotes('');
      setErrors({});
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Your Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          {cartItems.length === 0 ? (
            <p className="p-8 text-center text-gray-500">Your cart is empty.</p>
          ) : (
            <div className="p-4 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center space-x-4 border-b pb-2">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">₹{item.rate} / {item.unit}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={e => onUpdateQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                      className="w-16 p-1 border rounded-md text-center"
                    />
                    <p className="w-24 text-right font-medium">₹{(item.rate * item.qty).toFixed(2)}</p>
                  </div>
                  <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <form onSubmit={handleSubmit} className="p-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={`mt-1 block w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile *</label>
                <input type="tel" id="mobile" value={mobile} onChange={e => setMobile(e.target.value)} className={`mt-1 block w-full border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`} />
                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
              </div>
              <div>
                <label htmlFor="gst" className="block text-sm font-medium text-gray-700">GST (Optional)</label>
                <input type="text" id="gst" value={gst} onChange={e => setGst(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address (Optional)</label>
                <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <div className="text-xl font-bold text-gray-800">
                Grand Total: <span className="text-blue-600">₹{grandTotal.toFixed(2)}</span>
              </div>
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
                Place Order
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CartModal;
