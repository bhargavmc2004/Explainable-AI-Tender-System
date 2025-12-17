import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import VendorDashboard from './components/VendorDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import { User, UserRole, Tender, VendorProfile } from './types';
import { api } from './services/api';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false); // For login action specifically
    const [isInitializing, setIsInitializing] = useState(true); // For initial app load
    const [error, setError] = useState<string | null>(null);
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [vendorProfiles, setVendorProfiles] = useState<VendorProfile[]>([]);

    const refreshData = useCallback(async () => {
        try {
            await api.processClosedTenders();
            const [tendersData, vendorsData] = await Promise.all([
                api.getTenders(),
                api.getVendorProfiles(),
            ]);
            setTenders(tendersData);
            setVendorProfiles(vendorsData);
        } catch (err) {
            console.error("Background data refresh failed:", err);
            // Don't set a global error for background refresh, to avoid disrupting the user.
            // A small toast or indicator could be used in a real app.
        }
    }, []);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                await refreshData();
            } catch (err) {
                 setError('Failed to load initial application data.');
            } finally {
                setIsInitializing(false);
            }
        };

        initializeApp();
        
        const interval = setInterval(refreshData, 5000); // Silently poll for updates
        return () => clearInterval(interval);
    }, [refreshData]);

    const handleLogin = async (id: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const user = await api.login(id, password);
            if (user) {
                setCurrentUser(user);
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleTenderUpdate = (updatedTender: Tender) => {
        setTenders(prevTenders => prevTenders.map(t => t.id === updatedTender.id ? updatedTender : t));
    };

    const handleTenderCreated = (newTender: Tender) => {
        setTenders(prevTenders => [newTender, ...prevTenders]);
    };

    if (isInitializing) {
        return <div className="min-h-screen flex items-center justify-center text-lg font-medium text-gray-600">Initializing Application...</div>;
    }

    if (!currentUser) {
        return <Login onLogin={handleLogin} error={error} isLoading={isLoading} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold text-primary-600">AI Tender System</h1>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-700 mr-4">Welcome, <span className="font-semibold">{currentUser.name}</span></span>
                            <button onClick={handleLogout} className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Logout</button>
                        </div>
                    </div>
                </nav>
            </header>
            <main>
                {currentUser.role === UserRole.VENDOR ? (
                    <VendorDashboard user={currentUser} tenders={tenders} vendorProfiles={vendorProfiles} onBidPlaced={handleTenderUpdate} />
                ) : (
                    <EmployerDashboard 
                        user={currentUser} 
                        tenders={tenders} 
                        vendorProfiles={vendorProfiles} 
                        onTenderCreated={handleTenderCreated} 
                        onTenderUpdated={handleTenderUpdate}
                    />
                )}
            </main>
        </div>
    );
};

export default App;