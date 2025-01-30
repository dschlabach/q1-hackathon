"use client";

import { useGame } from "@/app/hooks/useGame";
import { useParams } from "next/navigation";

// Mock data for when real data is not available
const mockGame = {
  id: 1,
  created_at: new Date().toISOString(),
  game_agents: [
    {
      agent: {
        id: 1,
        name: "Agent Smith",
        prompt: "Strategic AI",
        health: 100,
        address: "0x123",
        created_at: new Date().toISOString(),
      },
    },
    {
      agent: {
        id: 2,
        name: "Agent Neo",
        prompt: "Tactical AI",
        health: 100,
        address: "0x456",
        created_at: new Date().toISOString(),
      },
    },
  ],
};

export default function GamePage() {
  const { gameId } = useParams();
  const gameData = useGame(gameId as string);

  // Use real data if available, otherwise use mock data
  const game = gameData || mockGame;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">
          Battle Arena #{gameId}
        </h1>

        <div className="flex justify-between items-start gap-8">
          {/* Left Agent */}
          <div className="flex-1">
            <div className="bg-gray-800 p-6 rounded-lg border-2 border-green-400">
              {game.game_agents[0] && (
                <div>
                  <div className="w-16 h-16 bg-gray-700 text-green-400 rounded-full flex items-center justify-center text-2xl border-2 border-green-400 mx-auto mb-4">
                    {game.game_agents[0].agent.name?.[0]}
                  </div>
                  <h2 className="text-xl font-bold text-center text-white mb-2">
                    {game.game_agents[0].agent.name}
                  </h2>
                  <div className="flex justify-center gap-4 text-sm">
                    <span className="text-green-400">
                      HP: {game.game_agents[0].agent.health}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Battle Text Area */}
          <div className="flex-[2] bg-gray-800 p-6 rounded-lg border border-gray-700 min-h-[300px]">
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400 text-center">
                {game.game_agents.length < 2
                  ? "Waiting for opponent..."
                  : "Battle will begin soon..."}
              </p>
            </div>
          </div>

          {/* Right Agent */}
          <div className="flex-1">
            <div className="bg-gray-800 p-6 rounded-lg border-2 border-green-400">
              {game.game_agents[1] ? (
                <div>
                  <div className="w-16 h-16 bg-gray-700 text-green-400 rounded-full flex items-center justify-center text-2xl border-2 border-green-400 mx-auto mb-4">
                    {game.game_agents[1].agent.name?.[0]}
                  </div>
                  <h2 className="text-xl font-bold text-center text-white mb-2">
                    {game.game_agents[1].agent.name}
                  </h2>
                  <div className="flex justify-center gap-4 text-sm">
                    <span className="text-green-400">
                      HP: {game.game_agents[1].agent.health}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  Waiting for opponent...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
