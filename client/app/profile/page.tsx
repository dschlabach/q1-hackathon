"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectedWallet from "../components/ConnectedWallet";
import { useAgents } from "../hooks/useAgents";
import { useGames } from "../hooks/useGames";
import { useCreateGame } from "../hooks/useCreateGame";

export default function Profile() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const {
    data: agents,
    isLoading: isLoadingAgents,
    error: agentsError,
  } = useAgents();
  const {
    data: games,
    isLoading: isLoadingGames,
    error: gamesError,
  } = useGames();
  const { mutate: createGame, isPending: isCreatingGame } = useCreateGame();
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const handleCreateLobby = () => {
    if (!selectedAgentId) {
      // TODO: Add toast notification to select an agent first
      console.error("Please select an agent first");
      return;
    }

    createGame(selectedAgentId, {
      onSuccess: () => {
        // TODO: Add success toast notification
        console.log("Lobby created successfully!");
      },
      onError: (error) => {
        console.error("Failed to create lobby:", error);
        // TODO: Add error toast notification
      },
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-20 bg-gray-900">
      <ConnectedWallet />

      <div className="flex flex-1 w-full max-w-4xl flex-col sm:flex-row gap-6">
        <div className="flex flex-col flex-1">
          <h1 className="text-2xl font-bold mb-8 text-white">Your AI Agents</h1>

          <button
            type="button"
            onClick={() => router.push("/create")}
            className="mb-8 bg-gray-800 text-green-400 border border-green-400 py-2 px-6 rounded-md hover:bg-green-400 hover:text-gray-900 transition-all duration-200 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
          >
            Create New Agent
          </button>

          <div className="w-full max-w-2xl">
            {isLoadingAgents ? (
              <div className="text-gray-400 text-center">
                Loading your agents...
              </div>
            ) : agentsError ? (
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
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`bg-gray-800 p-6 rounded-lg shadow-lg mb-4 flex items-center justify-between border-2 transition-all duration-200 cursor-pointer
                    ${
                      selectedAgentId === agent.id
                        ? "border-green-400 bg-gray-700 shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                        : "border-gray-700 hover:border-green-400"
                    }`}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-700 text-green-400 rounded-full flex items-center justify-center mr-4 border border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                      {agent.name?.[0]}
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
                  <div className="text-green-400">
                    {selectedAgentId === agent.id && "Selected ✓"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <h1 className="text-2xl font-bold mb-8 text-white">Battle Lobbies</h1>

          <div className="w-full max-w-2xl">
            {isLoadingGames ? (
              <div className="text-gray-400 text-center">
                Loading lobby rooms...
              </div>
            ) : gamesError ? (
              <div className="text-red-400 text-center">
                Error loading lobby rooms
              </div>
            ) : (
              <div className="flex flex-col">
                <button
                  onClick={handleCreateLobby}
                  disabled={!selectedAgentId || isCreatingGame}
                  className={`mb-8 py-2 px-6 rounded-md transition-all duration-200 
                    ${
                      selectedAgentId && !isCreatingGame
                        ? "bg-gray-800 text-green-400 border border-green-400 hover:bg-green-400 hover:text-gray-900 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                        : "bg-gray-700 text-gray-500 border border-gray-600 cursor-not-allowed"
                    }`}
                >
                  {isCreatingGame
                    ? "Creating Lobby..."
                    : selectedAgentId
                    ? "Create New Lobby"
                    : "Select an Agent First"}
                </button>
                {games?.length === 0 ? (
                  <div className="text-gray-400 text-center">
                    There are no lobby rooms active. Create one to get started!
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {games?.map((game) => (
                      <div
                        key={game.id}
                        className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-green-400 transition-all duration-200"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-white font-semibold">
                              Game #{game.id}
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">
                              Created{" "}
                              {new Date(game.created_at).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => console.log("Join game", game.id)}
                            className="px-4 py-2 text-green-400 border border-green-400 rounded-md hover:bg-green-400 hover:text-gray-900 transition-all duration-200 shadow-[0_0_10px_rgba(74,222,128,0.2)] hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                          >
                            Join Battle
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
