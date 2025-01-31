"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ConnectedWallet from "../components/ConnectedWallet";
import { useAgentSelection } from "../hooks/useAgentSelection";
import { AgentsList } from "../components/AgentsList";
import { BattleLobbies } from "../components/BattleLobbies";

export default function Profile() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const {
    selectedAgentId,
    setSelectedAgentId,
    agents,
    isLoadingAgents,
    agentsError,
    games,
    isLoadingGames,
    gamesError,
    isMyAgent,
    getMyAgentInGame,
    isSelectedAgentInGame,
    isSelectedAgentInAnyGame,
  } = useAgentSelection();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-20 bg-gray-900">
      <ConnectedWallet />

      <div className="flex flex-1 w-full max-w-4xl flex-col sm:flex-row gap-6">
        <AgentsList
          agents={agents}
          isLoadingAgents={isLoadingAgents}
          agentsError={agentsError}
          selectedAgentId={selectedAgentId}
          setSelectedAgentId={setSelectedAgentId}
        />
        <BattleLobbies
          games={games}
          isLoadingGames={isLoadingGames}
          gamesError={gamesError}
          selectedAgentId={selectedAgentId}
          isMyAgent={isMyAgent}
          getMyAgentInGame={getMyAgentInGame}
          isSelectedAgentInGame={isSelectedAgentInGame}
          isSelectedAgentInAnyGame={isSelectedAgentInAnyGame}
        />
      </div>
    </main>
  );
}
