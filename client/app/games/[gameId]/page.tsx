"use client";

import { type GameUpdate, useGame } from "@/app/hooks/useGame";
import { useParams } from "next/navigation";
import ConnectedWallet from "@/app/components/ConnectedWallet";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useAgentSelection } from "@/app/hooks/useAgentSelection";
import BattleAgentCard from "@/app/components/BattleAgentCard";

const ORCHESTRATOR_ID = 9999999;

export default function GamePage() {
  const { gameId } = useParams();
  const { game, metadata } = useGame(gameId as string);
  const { address } = useAccount();
  const { isMyAgent } = useAgentSelection();

  if (!metadata) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-green-400">Loading battle...</div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-20 bg-gray-900">
      <div className="absolute top-4 left-4">
        <Link
          href="/profile"
          className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2"
        >
          Back to Profile
        </Link>
      </div>
      <ConnectedWallet />

      <div className="w-full max-w-6xl">
        {!metadata.game_agents.some((ga) =>
          isMyAgent(ga.agent.address, address)
        ) && (
          <div className="text-gray-500 text-center mb-2 italic">
            Spectating
          </div>
        )}
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Battle Arena #{gameId}
        </h1>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4">
          <div className="flex justify-between items-center text-gray-300">
            <div>
              Status: <span className="text-green-400">{metadata.status}</span>
            </div>
            <div>
              Created:{" "}
              <span className="text-green-400">
                {new Date(metadata.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start gap-4">
          {/* Left Agent */}
          <div className="flex-1">
            <BattleAgentCard
              agent={metadata.game_agents[0]}
              isMyAgent={
                metadata.game_agents[0]
                  ? isMyAgent(metadata.game_agents[0].agent.address, address)
                  : false
              }
              currentHealth={
                game.find(
                  (update) =>
                    update.agent_id === metadata.game_agents[0]?.agent.id
                )?.health
              }
            />
          </div>

          {/* Battle Text Area */}
          <div className="flex-[2] bg-gray-800 p-4 rounded-lg border border-gray-700 min-h-[300px] max-h-[60vh] overflow-y-auto">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {/* Parse the game JSON string and display battle text */}
                {game?.map((update: GameUpdate, index: number) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <div key={index} className="mb-2">
                    {update.agent_id === ORCHESTRATOR_ID ? (
                      <p className="text-yellow-400 text-center">
                        {update.text}
                      </p>
                    ) : (
                      <p className="text-green-400">
                        Agent {update.agent_id}: {update.text}
                        {update.health !== undefined &&
                          ` (HP: ${update.health})`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-gray-400 text-center mt-4">
                {metadata.game_agents.length < 2
                  ? "Waiting for opponent..."
                  : "Battle in progress..."}
              </div>
            </div>
          </div>

          {/* Right Agent */}
          <div className="flex-1">
            <BattleAgentCard
              agent={metadata.game_agents[1]}
              isMyAgent={
                metadata.game_agents[1]
                  ? isMyAgent(metadata.game_agents[1].agent.address, address)
                  : false
              }
              currentHealth={metadata.game_agents[1]?.agent.health ?? undefined}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
