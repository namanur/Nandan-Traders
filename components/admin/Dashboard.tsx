import React from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { PendingOrder, Order } from '../../types';
import { ProductIcon, OrderIcon, CheckCircleIcon, ExclamationCircleIcon } from '../Icons';

interface DashboardProps {
    setView: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
    const { products } = useProducts();
    const [pendingOrders] = useLocalStorage<PendingOrder[]>('pendingOrders', []);
    const [completedOrders] = useLocalStorage<Order[]>('completedOrders', []);

    const stats = [
        { label: 'Total Products', value: products.length, icon: ProductIcon, color: 'blue', view: 'products' },
        { label: 'Pending Orders', value: pendingOrders.length, icon: ExclamationCircleIcon, color: 'yellow', view: 'orders' },
        { label: 'Completed Orders', value: completedOrders.length, icon: CheckCircleIcon, color: 'green', view: 'orders' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map(stat => (
                    <div 
                        key={stat.label} 
                        className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${stat.color}-500 flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow`}
                        onClick={() => setView(stat.view)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && setView(stat.view)}
                    >
                        <div>
                            <p className="text-gray-500">{stat.label}</p>
                            <p className="text-4xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                        <stat.icon className={`h-12 w-12 text-${stat.color}-400`} />
                    </div>
                ))}
            </div>
            <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <button onClick={() => setView('products')} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        Manage Products
                    </button>
                    <button onClick={() => setView('orders')} className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">
                        View Orders
                    </button>
                    <button onClick={() => setView('settings')} className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                        Configure Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
