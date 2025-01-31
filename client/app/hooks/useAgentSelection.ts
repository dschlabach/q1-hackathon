import { useState } from "react";
import { useAgents } from "./useAgents";
import { useGames } from "./useGames";

export type Agent = {
  id: number;
  name: string | null;
  prompt: string | null;
  health: number | null;
  address: string | null;
  created_at: string;
  wins?: number;
};

export type Game = {
  id: number;
  created_at: string;
  game_agents: {
    agent: Agent;
  }[];
};

export function useAgentSelection() {
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const {
    data: agents,
    isLoading: isLoadingAgents,
    error: agentsError,
  } = useAgents();
  const {
    data: games,
    isLoading: isLoadingGames,
    error: gamesError,
  } = useGames() as {
    data: Game[] | undefined;
    isLoading: boolean;
    error: unknown;
  };

  // Helper function to check if an agent belongs to the current user
  const isMyAgent = (agentAddress: string | null, currentAddress?: string) => {
    if (!agentAddress || !currentAddress) return false;
    return currentAddress.toLowerCase() === agentAddress.toLowerCase();
  };

  // Helper function to check if the user has an agent in a game
  const getMyAgentInGame = (game: Game, currentAddress?: string) => {
    return game.game_agents.find((ga) =>
      isMyAgent(ga.agent.address, currentAddress)
    );
  };

  // Helper function to check if selected agent is already in a game
  const isSelectedAgentInGame = (game: Game) => {
    return game.game_agents.some((ga) => ga.agent.id === selectedAgentId);
  };

  // Helper function to check if selected agent is in any game
  const isSelectedAgentInAnyGame = () => {
    return games?.some((game) => isSelectedAgentInGame(game)) ?? false;
  };

  return {
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
  };
}
