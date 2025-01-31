import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { type Game } from "../hooks/useAgentSelection";
import { useCreateGame } from "../hooks/useCreateGame";
import { useJoinGame } from "../hooks/useJoinGame";

interface BattleLobbiesProps {
  games?: Game[];
  isLoadingGames: boolean;
  gamesError: unknown;
  selectedAgentId: number | null;
  isMyAgent: (agentAddress: string, currentAddress?: string) => boolean;
  getMyAgentInGame: (
    game: Game,
    currentAddress?: string
  ) => { agent: Game["game_agents"][number]["agent"] } | undefined;
  isSelectedAgentInGame: (game: Game) => boolean;
  isSelectedAgentInAnyGame: () => boolean;
}

export function BattleLobbies({
  games,
  isLoadingGames,
  gamesError,
  selectedAgentId,
  isMyAgent,
  getMyAgentInGame,
  isSelectedAgentInGame,
  isSelectedAgentInAnyGame,
}: BattleLobbiesProps) {
  const router = useRouter();
  const { address } = useAccount();
  const { mutate: createGame, isPending: isCreatingGame } = useCreateGame();
  const { mutate: joinGame } = useJoinGame();

  const handleJoinBattle = async (game: Game) => {
    if (!selectedAgentId) {
      alert("Please select an agent first");
      return;
    }

    const myAgentInGame = getMyAgentInGame(game, address);

    // If my agent is already in this game, redirect to the game page
    if (myAgentInGame) {
      router.push(`/games/${game.id}`);
      return;
    }

    // If I have the selected agent in another game, don't allow joining
    if (isSelectedAgentInAnyGame()) {
      alert("This agent is already in another game");
      return;
    }

    // If someone else's agent is in the game and it's not full, join it
    if (game.game_agents.length < 2 && !getMyAgentInGame(game, address)) {
      try {
        joinGame({
          gameId: game.id.toString(),
          agentId: selectedAgentId,
        });
        router.push(`/games/${game.id}`);
      } catch (error) {
        console.error("Failed to join game:", error);
        alert("Failed to join game. Please try again.");
      }
    }
  };

  const handleCreateLobby = () => {
    if (!selectedAgentId) {
      // TODO: Add toast notification to select an agent first
      console.error("Please select an agent first");
      return;
    }

    // Check if agent is already in a game
    if (isSelectedAgentInAnyGame()) {
      console.error("This agent is already in a lobby");
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
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold mb-3 text-white">Battle Lobbies</h1>
      <p className="text-gray-400 mb-4 text-sm">
        Create a battle lobby to challenge other agents. Select one of your
        agents first, then create a lobby where others can join to battle
        against your agent.
      </p>

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
              type="button"
              onClick={handleCreateLobby}
              disabled={
                !selectedAgentId || isCreatingGame || isSelectedAgentInAnyGame()
              }
              className={`mb-4 py-2 px-6 rounded-md transition-all duration-200
                ${
                  selectedAgentId &&
                  !isCreatingGame &&
                  !isSelectedAgentInAnyGame()
                    ? "bg-gray-800 text-green-400 border border-green-400 hover:bg-green-400 hover:text-gray-900 shadow-[0_0_15px_rgba(74,222,128,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                    : "bg-gray-700 text-gray-500 border border-gray-600 cursor-not-allowed"
                }`}
            >
              {isCreatingGame
                ? "Creating Lobby..."
                : !selectedAgentId
                ? "Select an Agent First"
                : isSelectedAgentInAnyGame()
                ? "Agent Already in Lobby"
                : "Create New Lobby"}
            </button>
            <div className="max-h-[60vh] overflow-y-auto">
              {games?.length === 0 ? (
                <div className="text-gray-400 text-center">
                  There are no lobby rooms active. Create one to get started!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {games?.map((game) => (
                    <div
                      key={game.id}
                      className="min-h-[104px] bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700 hover:border-green-400 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-semibold">
                            Game #{game.id}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1">
                            Created {new Date(game.created_at).toLocaleString()}
                          </p>
                          <div className="mt-3">
                            <p className="text-gray-400 text-sm mb-2">
                              Agents in lobby:
                            </p>
                            {game.game_agents?.map((gameAgent) => (
                              <div
                                key={gameAgent.agent.id}
                                className="flex items-center gap-2 mb-1"
                              >
                                <div className="w-6 h-6 bg-gray-700 text-green-400 rounded-full flex items-center justify-center text-xs border border-green-400">
                                  {gameAgent.agent.name?.[0]}
                                </div>
                                <span
                                  className={`text-sm ${
                                    isMyAgent(
                                      gameAgent.agent.address ?? "",
                                      address
                                    )
                                      ? "text-green-400"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {gameAgent.agent.name}
                                  {isMyAgent(
                                    gameAgent.agent.address ?? "",
                                    address
                                  ) && " (You)"}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  (HP: {gameAgent.agent.health})
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center gap-4">
                            {/* Show different buttons/text based on game state */}
                            {selectedAgentId && isSelectedAgentInGame(game) ? (
                              <button
                                type="button"
                                onClick={() => router.push(`/games/${game.id}`)}
                                className="px-4 py-2 text-green-400 border border-green-400 rounded-md hover:bg-green-400 hover:text-gray-900 transition-all duration-200 shadow-[0_0_10px_rgba(74,222,128,0.2)] hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                              >
                                Return to Battle
                              </button>
                            ) : game.game_agents.length >= 2 ? (
                              <span className="text-gray-500 text-sm">
                                Battle in progress
                              </span>
                            ) : selectedAgentId &&
                              !isSelectedAgentInAnyGame() ? (
                              <button
                                type="button"
                                onClick={() => handleJoinBattle(game)}
                                className="px-4 py-2 text-green-400 border border-green-400 rounded-md hover:bg-green-400 hover:text-gray-900 transition-all duration-200 shadow-[0_0_10px_rgba(74,222,128,0.2)] hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                              >
                                Join Battle
                              </button>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                Select an agent to join
                              </span>
                            )}

                            {/* Spectate link */}
                            {selectedAgentId &&
                              !isSelectedAgentInGame(game) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(`/games/${game.id}`)
                                  }
                                  className="text-gray-400 text-sm hover:text-green-400 transition-colors"
                                >
                                  {getMyAgentInGame(game, address)
                                    ? "View battle"
                                    : "Spectate"}
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
