'use client';
import { useAutoRenewContext } from "@/context/AutoRenewContext";

interface AutoRenewToggleProps {
  subscriptionData: {
    id: string;
    autoRenew: boolean;
  };
}

export default function AutoRenewToggle({ subscriptionData }: AutoRenewToggleProps) {
  const { autoRenew, onToggleAutoRenew } = useAutoRenewContext();

  const handleSubmit = async() => {
    const newAutoRenewStatus = !autoRenew;
  
    onToggleAutoRenew();
    
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionData.id}`, {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
              autoRenew: newAutoRenewStatus,
          }),
      });
      
      const data = await response.json();
      
      if(!data.success){
          onToggleAutoRenew();
          console.error("Failed to update auto-renew:", data.message);
      } else {
          console.log("Auto-renew updated successfully:", data);
      }
    } catch (error) {
        onToggleAutoRenew();
        console.error("Error updating auto-renew status:", error);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4"> 
      <span className="text-gray-700 text-sm">Auto Renew:</span>
      <button
        onClick={handleSubmit}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300
          ${autoRenew ? "bg-green-600" : "bg-gray-400"}`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300
            ${autoRenew ? "translate-x-6" : "translate-x-0"}`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700">
        {autoRenew ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}