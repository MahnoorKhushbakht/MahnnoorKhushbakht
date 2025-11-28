import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-65 from-black-500 to-gray-700">
      <div className="mt-5">
        <ChatInterface />
      </div>
    </div>
  );
}
