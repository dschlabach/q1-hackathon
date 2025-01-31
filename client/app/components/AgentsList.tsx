import { useRouter } from "next/navigation";
import { type Agent } from "../hooks/useAgentSelection";

interface AgentsListProps {
  agents?: Agent[];
  isLoadingAgents: boolean;
  agentsError: unknown;
  selectedAgentId: number | null;
  setSelectedAgentId: (id: number) => void;
}

export function AgentsList({
  agents,
  isLoadingAgents,
  agentsError,
  selectedAgentId,
  setSelectedAgentId,
}: AgentsListProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold mb-3 text-white">Your AI Agents</h1>

      <p className="text-gray-400 mb-4 text-sm">
        Create an AI Agent with a unique prompt that defines its personality and
        battle strategy. Each agent can participate in battles and earn wins to
        earn rewards.
      </p>

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
          <div className="text-red-400 text-center">Error loading agents</div>
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
  );
}
