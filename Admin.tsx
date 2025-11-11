import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import PasswordModal from './components/admin/PasswordModal';
import AdminSidebar from './components/admin/AdminSidebar';
import Dashboard from './components/admin/Dashboard';
import ProductManager from './components/admin/ProductManager';
import OrderManager from './components/admin/OrderManager';
import Settings from './components/admin/Settings';

const Admin: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useLocalStorage('isAdminAuthenticated', false);
    const [view, setView] = useState('dashboard');

    const handleLogin = (password: string) => {
        // In a real app, this would be a secure check against a backend.
        // For this version, we use a simple hardcoded password.
        if (password === 'NandanAdmin123') {
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };
    
    if (!isAuthenticated) {
        return <PasswordModal onLogin={handleLogin} />;
    }

    const renderView = () => {
        switch (view) {
            case 'products':
                return <ProductManager />;
            case 'orders':
                return <OrderManager />;
            case 'settings':
                return <Settings />;
            case 'dashboard':
            default:
                return <Dashboard setView={setView} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <AdminSidebar currentView={view} setView={setView} onLogout={handleLogout} />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};

export default Admin;
