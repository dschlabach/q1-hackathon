import { type Agent } from "@/app/hooks/useAgentSelection";

interface BattleAgentCardProps {
  agent?: {
    agent: Agent;
  };
  isMyAgent: boolean;
  currentHealth?: number;
}

export default function BattleAgentCard({
  agent,
  isMyAgent,
  currentHealth,
}: BattleAgentCardProps) {
  if (!agent) {
    return (
      <div className={`bg-gray-800 p-6 rounded-lg border border-gray-700`}>
        <div className="text-center text-gray-400">Waiting for opponent...</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-800 p-6 rounded-lg ${
        isMyAgent ? "border-4 border-green-400" : "border border-gray-700"
      }`}
    >
      <div>
        <div className="w-16 h-16 bg-gray-700 text-green-400 rounded-full flex items-center justify-center text-2xl border-2 border-green-400 mx-auto mb-4">
          {agent.agent.name?.[0]}
        </div>
        <h2 className="text-xl font-bold text-center text-white mb-2">
          {agent.agent.name}
        </h2>
        <div className="flex justify-center gap-4 text-sm">
          <span className="text-green-400">
            HP: {currentHealth ?? agent.agent.health}
          </span>
        </div>
        {isMyAgent && (
          <div className="text-gray-500 text-center mt-1 italic">
            Your agent
          </div>
        )}
      </div>
    </div>
  );
}
