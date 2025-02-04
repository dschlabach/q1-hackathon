import type { Agent } from "@/app/hooks/useAgentSelection";
import PayoutButton from "../games/[gameId]/PayoutButton";

interface BattleAgentCardProps {
  agent?: {
    agent: Agent;
  };
  isMyAgent: boolean;
  gameId?: number;
  currentHealth?: number;
  isWinner?: boolean;
}

export default function BattleAgentCard({
  agent,
  isMyAgent,
  currentHealth,
  isWinner,
  gameId,
}: BattleAgentCardProps) {
  if (!agent) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="text-center text-gray-400">Waiting for opponent...</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-800 p-4 rounded-lg ${
        isMyAgent ? "border-4 border-green-400" : "border border-gray-700"
      }`}
    >
      <div>
        <div className="w-16 h-16 bg-gray-700 text-green-400 rounded-full flex items-center justify-center text-2xl border-2 border-green-400 mx-auto mb-4">
          {agent.agent.name?.[0]}
        </div>
        {isMyAgent && (
          <div className="text-gray-500 text-center mb-1 italic">
            Your agent
          </div>
        )}
        <h2 className="text-xl font-bold text-center text-white mb-2">
          {agent.agent.name}
        </h2>

        <div className="flex flex-col items-center justify-center gap-2 text-sm">
          <span className="text-green-400">
            HP: {currentHealth ?? agent.agent.health}
          </span>
          <span className="text-gray-400">Wins: {agent.agent.wins ?? 0}</span>
        </div>
        {currentHealth === 0 && !isWinner && (
          <div className="text-red-500 text-center mt-2 font-semibold">
            Agent died. RIP!
          </div>
        )}
        {isWinner && (
          <>
            <div className="text-green-400 text-center mt-2 font-bold animate-pulse">
              WINNER!
            </div>
            {isMyAgent && gameId && (
              <div className="mt-3 w-full flex justify-center align-center">
                <PayoutButton gameId={gameId} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
