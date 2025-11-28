'use client';
import React from 'react';
import AutoRenewToggle from './AutoRenewToggle';

interface Subscription {
  id: string;
  tier: string;
  autoRenew: boolean;
  bundle: {
    tier: string;
  };
}

export default function Header() {
    const [currentSubscription, setCurrentSubscription] = React.useState<Subscription | null>(null);
    const [loading, setLoading] = React.useState(false);
    
    const fetchSubscription = async () => {
        try {
            const response = await fetch("/api/subscription", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include'
            });
            const data = await response.json();
            console.log("Subscription data:", data); 
            if(data.success && data.data && data.data.length > 0){
                setCurrentSubscription(data.data[0]);
            }
        } catch (error) {
            console.error("Error fetching subscription:", error);
        }
    };

    const handleCancelSubscription = async () => {
        if (!currentSubscription) return;
        
        if (!confirm("Are you sure you want to cancel your subscription? Your access will continue until the end of your billing period.")) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/subscriptions/${currentSubscription.id}/cancel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert("Subscription cancelled successfully!");
                setCurrentSubscription(null); 
                window.location.reload(); 
            } else {
                alert("Failed to cancel subscription: " + data.message);
            }
        } catch (error) {
            console.error("Error cancelling subscription:", error);
            alert("Error cancelling subscription. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchSubscription();
    }, []);

    return (
        <header className="w-full bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center"> 
                    <div className="shrink-0 flex items-center">
                        <h1 className="text-xl font-bold text-gray-900">My App</h1>
                    </div>
                    <nav className="flex space-x-4 items-center">
                        {currentSubscription && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">
                                    {currentSubscription.bundle.tier} Plan
                                </span>
                                <AutoRenewToggle subscriptionData={currentSubscription} />
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={loading}
                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                                >
                                    {loading ? "Cancelling..." : "Cancel"}
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}