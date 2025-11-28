'use client';
import React, { useState } from "react";
import { useModelContext } from "@/context/ModelContext";
import SubscriptionPlan from "./SubscriptionPlan";

interface Message {
  text: string;
  isUser: boolean;
  quotaInfo?: {
    freeRemaining: number;
    isFree: boolean;
  };
}

export default function ChatInterface() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState<number>(3);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);

  const { onOpen } = useModelContext();


  const fetchData = async () => {
    try {
      const response = await fetch("/api/subscription", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!data.success) return;

      const sub = data.data?.[0];

      if (sub && sub.bundle) {
        setHasSubscription(true);

        const max = sub.bundle.maxMessages ?? Infinity; 

        setFreeRemaining(max);
      } else {
        setHasSubscription(false);
        setFreeRemaining(3);
      }
    } catch (error) {
      console.error("Error fetching quota:", error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    if (!hasSubscription && freeRemaining === 0) {
      onOpen();
      return;
    }

    setLoading(true);

    const userMessage: Message = { text: userInput, isUser: true };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userInput }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          text: data.data.answer,
          isUser: false,
          quotaInfo: data.data.quotaInfo,
        };
        setMessages((prev) => [...prev, aiMessage]);

        if (!hasSubscription && data.data.quotaInfo) {
          setFreeRemaining(data.data.quotaInfo.freeRemaining);
        }

        if (hasSubscription && freeRemaining !== Infinity) {
          setFreeRemaining((prev) => prev - 1);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { text: `Error: ${data.error.message}`, isUser: false },
        ]);

        if (data.error.code === "FREE_QUOTA_EXCEEDED") {
          onOpen();
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Network error. Please try again.", isUser: false },
      ]);
    } finally {
      setLoading(false);
      setUserInput("");
    }
  };

  return (
    <div className="p-4 w-full max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">AI Chatbot Interface</h1>

      <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium text-green-900">
            {hasSubscription ? "Messages Remaining:" : "Free Messages Remaining:"}
          </span>

          <span
            className={`font-bold ${
              freeRemaining === 0 ? "text-red-600" : "text-green-700"
            }`}
          >
            {freeRemaining === Infinity ? "∞" : freeRemaining}
            {!hasSubscription && "/3"}
          </span>
        </div>

        {!hasSubscription && freeRemaining === 0 && (
          <p className="text-sm text-red-600 mt-1">
            💡 Your free messages have ended.
          </p>
        )}
      </div>

      <div className="h-80 border border-gray-300 rounded-lg p-4 mb-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center mt-10">
            Start a conversation with AI...
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 ${msg.isUser ? "text-right" : "text-left"}`}
            >
              <div
                className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.isUser
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="text-left mb-3">
            <div className="inline-block bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
              AI is thinking...
            </div>
          </div>
        )}
      </div>


      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          disabled={loading || (!hasSubscription && freeRemaining === 0)}
        />

        <button
          type="submit"
          disabled={loading || !userInput.trim() || (!hasSubscription && freeRemaining === 0)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>

      {!hasSubscription && freeRemaining === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg shadow-sm">
          <h3 className="font-bold text-yellow-800">✨ Upgrade to Continue</h3>
          <p className="text-yellow-700 text-sm mt-1">Your free messages are finished.</p>

          <button
            onClick={onOpen}
            className="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            View Subscription Plans
          </button>
        </div>
      )}

      <SubscriptionPlan />
    </div>
  );
}
