import React from 'react';
import { DashboardIcon, ProductIcon, OrderIcon, SettingsIcon, LogoutIcon } from '../Icons';

interface AdminSidebarProps {
    currentView: string;
    setView: (view: string) => void;
    onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, setView, onLogout }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
        { id: 'products', label: 'Products', icon: ProductIcon },
        { id: 'orders', label: 'Orders', icon: OrderIcon },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <aside className="w-64 bg-gray-800 text-white flex-shrink-0 flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold">Admin Panel</h2>
                <p className="text-sm text-gray-400">Nandan Traders</p>
            </div>
            <nav className="flex-grow p-2">
                <ul>
                    {navItems.map(item => (
                        <li key={item.id} className="mb-1">
                            <button 
                                onClick={() => setView(item.id)}
                                className={`w-full text-left flex items-center p-3 rounded-lg transition-colors ${
                                    currentView === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                                }`}
                                aria-current={currentView === item.id ? 'page' : undefined}
                            >
                                <item.icon className="h-6 w-6 mr-3" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-2 border-t border-gray-700">
                <a href="/" target="_blank" rel="noopener noreferrer" className="w-full text-left flex items-center p-3 rounded-lg transition-colors hover:bg-gray-700 text-sm text-gray-300">
                   View Live Site
                </a>
                <button 
                    onClick={onLogout}
                    className="w-full text-left flex items-center p-3 rounded-lg transition-colors hover:bg-gray-700"
                >
                    <LogoutIcon className="h-6 w-6 mr-3" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
