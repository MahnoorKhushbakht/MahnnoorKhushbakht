import { useModelContext } from "@/context/ModelContext";
import { useAutoRenewContext } from "@/context/AutoRenewContext";
import React, { useEffect } from "react";
import AutoRenewToggle from "./AutoRenewToggle";


interface Subscription {
  id: string;
  tier: string;
  billingCycle: string;
  price: number;
  autoRenew: boolean;
  messagesLimit: number | "INFINITE";
  isActive: boolean;
}

export default function SubscriptionPlan() {
  const { isOpen, onClose } = useModelContext();
  const { autoRenew } = useAutoRenewContext();
  const [currentSubscription, setCurrentSubscription] = React.useState<Subscription | null>(null);
  const [billingCycle, setBillingCycle] = React.useState<"MONTHLY" | "YEARLY">("MONTHLY");

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

  useEffect(() => {
    fetchSubscription();
  }, []);

  const calculatePrice = (basePrice: number) => {
    if (billingCycle === "YEARLY") {
      return basePrice * 12 * 0.9; 
    }
    return basePrice;
  };

  const handleFailedSubscription = async (subscriptionId?: string) => {
    try {
      const idToUse = subscriptionId || currentSubscription?.id;
      
      if (!idToUse) {
        alert("Subscription failed: Unable to identify subscription");
        return;
      }

      const response = await fetch(`/api/subscription/${idToUse}/failed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update subscription status");
      }
      
      alert("Subscription failed: " + data.message);
    
      fetchSubscription();
    } catch (err) {
      console.error("Error handling failed subscription:", err);
      alert("Error handling failed subscription: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleSubscribe = async (
    tier: string,
    price: number,
    messages: number | "INFINITE"
  ) => {
    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier: tier.toUpperCase(),
          billingCycle,
          price: calculatePrice(price),
          autoRenew,
          messagesLimit: messages,
        }),
      });

      const data = await response.json();
      console.log("Subscription response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Subscription creation failed");
      }

      if (data.success) {
        fetchSubscription();
        alert("Subscription created successfully!");
        onClose(); 
      }

    } catch (error) {
      alert("Subscription failed:"+ error);
      await handleFailedSubscription();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-black w-full max-w-2xl p-6 rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Choose a Subscription Plan
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-700 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="font-semibold text-gray-100 text-lg">Basic</h3>
            <p className="text-3xl font-bold text-gray-300 mt-2">
              $9.99<span className="text-sm text-gray-500">/month</span>
            </p>

            <ul className="mt-4 text-sm text-gray-200 space-y-2">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span>
                10 messages per month
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span>
                Standard AI model
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span>
                Email support
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe("basic", 9.99, 10)}
              className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              {currentSubscription ? "Change to Basic" : "Buy Basic"}
            </button>
          </div>

          <div className="p-6 border-2 border-green-500 rounded-xl bg-green-50 relative transform hover:scale-105 transition-all duration-300">
            <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              POPULAR
            </span>
            <h3 className="font-semibold text-gray-900 text-lg">Pro</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              $19.99<span className="text-sm text-gray-500">/month</span>
            </p>

            <ul className="mt-4 text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span>
                100 messages per month
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span>
                Fast AI model
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span>
                Priority support
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe("pro", 19.99, 100)}
              className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              {currentSubscription ? "Change to Pro" : "Buy Pro"}
            </button>
          </div>

          <div className="p-6 border-2 border-purple-300 rounded-xl hover:border-purple-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="font-semibold text-gray-100 text-lg">Enterprise</h3>
            <p className="text-3xl font-bold text-gray-300 mt-2">
              $99.99<span className="text-sm text-gray-500">/month</span>
            </p>

            <ul className="mt-4 text-sm text-gray-200 space-y-2">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span>
                Unlimited messages
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span>
                Custom AI models
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✔</span>
                Dedicated support
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe("enterprise", 99.99, "INFINITE")}
              className="w-full mt-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              {currentSubscription ? "Change to Enterprise" : "Buy Enterprise"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-200">
            All plans include auto-renewal. Cancel anytime.
          </p>
           {currentSubscription ? (
            <AutoRenewToggle subscriptionData={currentSubscription} />
          ) : (
            <div className="mt-2 text-sm text-gray-200">
              Auto-renewal will be enabled for new subscriptions
            </div>
          )}
          <div className="flex items-center justify-between mt-4">
            <span className="text-gray-200 font-sm">Billing Cycle:</span>
            <select
              value={billingCycle}
              onChange={(e) =>
                setBillingCycle(e.target.value as "MONTHLY" | "YEARLY")
              }
              className="border border-gray-300 rounded-md p-1"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly (10% OFF)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}