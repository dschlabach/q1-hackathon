"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectedWallet from "../components/ConnectedWallet";
import { useNextAgent } from "../hooks/useNextAgent";
import { useCreateAgent } from "../hooks/useCreateAgent";

export default function CreateAgent() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [agentName, setAgentName] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");
  const { data: nextAgent } = useNextAgent();
  const { mutate: createAgent, isPending: isCreating } = useCreateAgent();

  const isFormValid = agentName.trim() !== "" && agentPrompt.trim() !== "";

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const handleCreate = async () => {
    if (!isFormValid) return;
    if (!nextAgent?.id) {
      console.error("Waiting for agent ID...");
      // TODO: Add toast notification
      return;
    }

    try {
      // TODO: Call smart contract here
      // After smart contract confirmation:
      console.log(
        "Creating agent with ID:",
        nextAgent.id,
        "name:",
        agentName,
        "prompt:",
        agentPrompt
      );
      createAgent(
        {
          id: nextAgent.id,
          name: agentName,
          prompt: agentPrompt,
        },
        {
          onSuccess: () => {
            router.push("/profile");
          },
          onError: (error) => {
            console.error("Failed to create agent:", error);
            // TODO: Add error toast notification
          },
        }
      );
    } catch (error) {
      console.error("Error creating agent:", error);
      // TODO: Add error toast notification
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <ConnectedWallet />

      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Create AI Agent
        </h1>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
          <div className="mb-6">
            <label
              htmlFor="agentName"
              className="block text-sm font-medium text-green-400 mb-2"
            >
              Agent Name
            </label>
            <input
              type="text"
              id="agentName"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Enter agent name"
              disabled={isCreating}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="agentPrompt"
              className="block text-sm font-medium text-green-400 mb-2"
            >
              Battle Prompt
            </label>
            <textarea
              id="agentPrompt"
              rows={6}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 resize-none"
              value={agentPrompt}
              onChange={(e) => setAgentPrompt(e.target.value)}
              placeholder="Enter the prompt that will define your agent's behavior in battles..."
              disabled={isCreating}
            />
            <p className="mt-2 text-sm text-gray-400">
              This prompt will determine how your agent behaves during battles.
              Make it strategic and specific!
            </p>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-400">Creation Price</span>
              <span className="text-white">0.009 ETH</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              This is a one-time fee to create your agent
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!isFormValid || isCreating}
            className={`w-full py-2 px-4 rounded-md transition-all duration-200 
              ${
                isFormValid && !isCreating
                  ? "bg-gray-700 text-green-400 border border-green-400 hover:bg-green-400 hover:text-gray-900 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                  : "bg-gray-700 text-gray-500 border border-gray-600 cursor-not-allowed"
              }`}
          >
            {isCreating ? "Creating Agent..." : "Create Agent"}
          </button>
        </div>
      </div>
    </main>
  );
}
