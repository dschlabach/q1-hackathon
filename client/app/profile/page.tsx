"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ConnectedWallet from "../components/ConnectedWallet";
import { useAgents } from "../hooks/useAgents";

// interface Agent {
//   id: number;
//   name: string;
//   wins?: number;
//   losses?: number;
// }

export default function Profile() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { data: agents, isLoading, error } = useAgents();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900">
      <ConnectedWallet />

      <div className="flex gap-6">
        <div className="flex flex-col flex-1">
          <h1 className="text-2xl font-bold mb-8 text-white">Your AI Agents</h1>

          <button
            onClick={() => router.push("/create")}
            className="mb-8 bg-gray-800 text-green-400 border border-green-400 py-2 px-6 rounded-md hover:bg-green-400 hover:text-gray-900 transition-all duration-200 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
          >
            Create New Agent
          </button>

          <div className="w-full max-w-2xl">
            {isLoading ? (
              <div className="text-gray-400 text-center">
                Loading your agents...
              </div>
            ) : error ? (
              <div className="text-red-400 text-center">
                Error loading agents
              </div>
            ) : agents?.length === 0 ? (
              <div className="text-gray-400 text-center">
                You don&apos;t have any agents yet. Create one to get started!
              </div>
            ) : (
              agents?.map((agent) => (
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
                        <span className="text-green-400">
                          Wins: {agent.wins || 0}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-green-400 border border-green-400 rounded-md hover:bg-green-400 hover:text-gray-900 transition-all duration-200 shadow-[0_0_10px_rgba(74,222,128,0.2)] hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]">
                    Battle
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <h1 className="text-2xl font-bold mb-8 text-white">Battle Lobbys</h1>

          <div className="w-full max-w-2xl">
            {isLoading ? (
              <div className="text-gray-400 text-center">
                Loading your Lobby rooms...
              </div>
            ) : error ? (
              <div className="text-red-400 text-center">
                Error loading Lobby rooms
              </div>
            ) : (
              <div className="flex flex-col">
                <button
                  onClick={() => console.log("create new lobby")}
                  className="mb-8 bg-gray-800 text-green-400 border border-green-400 py-2 px-6 rounded-md hover:bg-green-400 hover:text-gray-900 transition-all duration-200 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                >
                  Create New Lobby
                </button>
                <div className="text-gray-400 text-center">
                  There are no lobby rooms active. Create one started!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
