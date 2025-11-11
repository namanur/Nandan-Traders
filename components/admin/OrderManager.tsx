import React, { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { sendOrder } from '../../services/api';
import type { Order, PendingOrder } from '../../types';
import { RefreshIcon, TrashIcon, CheckCircleIcon, XIcon } from '../Icons';

const OrderDetailsModal: React.FC<{ order: Order, onClose: () => void }> = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">Order Details: {order.orderId}</h2>
                <button onClick={onClose}><XIcon className="h-6 w-6" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
                <div><strong>Name:</strong> {order.name}</div>
                <div><strong>Mobile:</strong> {order.mobile}</div>
                {order.gst && <div><strong>GST:</strong> {order.gst}</div>}
                {order.address && <div><strong>Address:</strong> {order.address}</div>}
                <div className="font-bold text-lg">Total: ₹{order.grandTotal.toFixed(2)}</div>
                <h3 className="font-semibold pt-2 border-t">Items:</h3>
                <ul className="list-disc list-inside space-y-1">
                    {order.items.map(item => (
                        <li key={item.id}>{item.name} x {item.qty} @ ₹{item.rate.toFixed(2)}</li>
                    ))}
                </ul>
                {order.notes && <div className="pt-2 border-t"><strong>Notes:</strong> {order.notes}</div>}
            </div>
        </div>
    </div>
);

const OrderManager: React.FC = () => {
    const [pendingOrders, setPendingOrders] = useLocalStorage<PendingOrder[]>('pendingOrders', []);
    const [completedOrders, setCompletedOrders] = useLocalStorage<Order[]>('completedOrders', []);
    const [retryingId, setRetryingId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const handleRetry = async (pOrder: PendingOrder) => {
        setRetryingId(pOrder.order.orderId);
        const result = await sendOrder(pOrder.order);
        if (result.ok) {
            setCompletedOrders(prev => [pOrder.order, ...prev]);
            setPendingOrders(prev => prev.filter(p => p.order.orderId !== pOrder.order.orderId));
            alert('Order sent successfully!');
        } else {
            setPendingOrders(prev => prev.map(p => p.order.orderId === pOrder.order.orderId ? { ...p, attemptCount: p.attemptCount + 1, lastAttempt: new Date().toISOString() } : p));
            alert(`Failed to send order: ${result.error || 'Unknown error'}`);
        }
        setRetryingId(null);
    };

    const handleDelete = (orderId: string, list: 'pending' | 'completed') => {
        if (window.confirm('Are you sure you want to delete this order record? This cannot be undone.')) {
            if (list === 'pending') {
                setPendingOrders(prev => prev.filter(p => p.order.orderId !== orderId));
            } else {
                setCompletedOrders(prev => prev.filter(o => o.orderId !== orderId));
            }
        }
    };
    
    const markAsComplete = (pOrder: PendingOrder) => {
        if (window.confirm('Manually mark this order as sent? Use this if you have confirmed delivery outside the app.')) {
            setCompletedOrders(prev => [pOrder.order, ...prev]);
            setPendingOrders(prev => prev.filter(p => p.order.orderId !== pOrder.order.orderId));
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Management</h1>
            
            {/* Pending Orders */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pending Orders ({pendingOrders.length})</h2>
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Table head */}
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        {/* Table body */}
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingOrders.map(pOrder => (
                                <tr key={pOrder.order.orderId}>
                                    <td className="px-6 py-4" onClick={() => setSelectedOrder(pOrder.order)}>{pOrder.order.orderId}</td>
                                    <td className="px-6 py-4">{pOrder.order.name}</td>
                                    <td className="px-6 py-4">₹{pOrder.order.grandTotal.toFixed(2)}</td>
                                    <td className="px-6 py-4">{pOrder.attemptCount}</td>
                                    <td className="px-6 py-4 space-x-2 flex items-center">
                                        <button onClick={() => handleRetry(pOrder)} disabled={retryingId === pOrder.order.orderId} className="text-blue-600 hover:text-blue-900 p-1 disabled:text-gray-300">
                                            <RefreshIcon className={`h-5 w-5 ${retryingId === pOrder.order.orderId ? 'animate-spin' : ''}`} />
                                        </button>
                                        <button onClick={() => markAsComplete(pOrder)} className="text-green-600 hover:text-green-900 p-1"><CheckCircleIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(pOrder.order.orderId, 'pending')} className="text-red-600 hover:text-red-900 p-1"><TrashIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             {/* Completed Orders */}
             <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Completed Orders ({completedOrders.length})</h2>
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                         {/* Table head */}
                         <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        {/* Table body */}
                        <tbody className="bg-white divide-y divide-gray-200">
                            {completedOrders.map(order => (
                                <tr key={order.orderId}>
                                    <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => setSelectedOrder(order)}>{order.orderId}</td>
                                    <td className="px-6 py-4">{order.name}</td>
                                    <td className="px-6 py-4">₹{order.grandTotal.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDelete(order.orderId, 'completed')} className="text-red-600 hover:text-red-900 p-1"><TrashIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </div>
    );
};

export default OrderManager;
