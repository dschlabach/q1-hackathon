"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ConnectedWallet from "../components/ConnectedWallet";

// Mock data for agents
const mockAgents = [
  { id: 1, name: "Agent Smith", wins: 5, losses: 2 },
  { id: 2, name: "Neo", wins: 8, losses: 1 },
  { id: 3, name: "Trinity", wins: 6, losses: 3 },
];

export default function Profile() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900">
      <ConnectedWallet />

      <h1 className="text-4xl font-bold mb-8 text-white">Your AI Agents</h1>

      <button
        onClick={() => router.push("/create")}
        className="mb-8 bg-gray-800 text-green-400 border border-green-400 py-2 px-6 rounded-md hover:bg-green-400 hover:text-gray-900 transition-all duration-200 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
      >
        Create New Agent
      </button>

      <div className="w-full max-w-2xl">
        {mockAgents.map((agent) => (
          <div
            key={agent.id}
            className="bg-gray-800 p-6 rounded-lg shadow-lg mb-4 flex items-center justify-between border border-gray-700 hover:border-green-400 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-700 text-green-400 rounded-full flex items-center justify-center mr-4 border border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                {agent.name[0]}
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">
                  {agent.name}
                </h3>
                <p className="text-gray-400">
                  <span className="text-green-400">Wins: {agent.wins}</span> |{" "}
                  <span className="text-red-400">Losses: {agent.losses}</span>
                </p>
              </div>
            </div>
            <button className="px-4 py-2 text-green-400 border border-green-400 rounded-md hover:bg-green-400 hover:text-gray-900 transition-all duration-200 shadow-[0_0_10px_rgba(74,222,128,0.2)] hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]">
              Battle
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
