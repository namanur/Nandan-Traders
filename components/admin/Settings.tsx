import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface AppSettings {
    chatId: string;
}

const Settings: React.FC = () => {
    const [settings, setSettings] = useLocalStorage<AppSettings>('settings', { chatId: '' });
    const [chatId, setChatId] = useState(settings.chatId || '');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        setChatId(settings.chatId || '');
    }, [settings.chatId]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSettings({ chatId });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Telegram Notifications</h2>
                        <p className="text-sm text-gray-500 mt-1">Configure where new order notifications are sent.</p>
                    </div>
                    <div>
                        <label htmlFor="chatId" className="block text-sm font-medium text-gray-700">Telegram Chat ID</label>
                        <input
                            type="text"
                            id="chatId"
                            value={chatId}
                            onChange={(e) => setChatId(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="-1001234567890"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Find this by adding the GetIDs Bot to your Telegram channel. The Bot Token is set in the code and cannot be changed here for security reasons.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button 
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                        >
                            Save Settings
                        </button>
                        {saveStatus === 'success' && <p className="text-green-600">Settings saved successfully!</p>}
                        {saveStatus === 'error' && <p className="text-red-600">Failed to save settings.</p>}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
