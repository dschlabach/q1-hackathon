"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectedWallet from "../components/ConnectedWallet";
import { useAgents } from "../hooks/useAgents";
import { useGames } from "../hooks/useGames";
import { useCreateGame } from "../hooks/useCreateGame";
import { useJoinGame } from "@/app/hooks/useJoinGame";

type Agent = {
	id: number;
	name: string | null;
	prompt: string | null;
	health: number;
	address: string;
	created_at: string;
};

type GameAgent = {
	agent: Agent;
};

type Game = {
	id: number;
	created_at: string;
	game_agents: GameAgent[];
};

export default function Profile() {
	const { isConnected, address } = useAccount();
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
	} = useGames() as {
		data: Game[] | undefined;
		isLoading: boolean;
		error: unknown;
	};
	const { mutate: createGame, isPending: isCreatingGame } = useCreateGame();
	const { mutate: joinGame } = useJoinGame();

	const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

	// Helper function to check if an agent belongs to the current user
	const isMyAgent = (agentAddress: string) => {
		return address?.toLowerCase() === agentAddress?.toLowerCase();
	};

	// Helper function to check if the user has an agent in a game
	const getMyAgentInGame = (game: Game) => {
		return game.game_agents.find((ga) => isMyAgent(ga.agent.address));
	};

	// Helper function to check if selected agent is already in a game
	const isSelectedAgentInGame = (game: Game) => {
		return game.game_agents.some((ga) => ga.agent.id === selectedAgentId);
	};

	const handleJoinBattle = async (game: Game) => {
		if (!selectedAgentId) {
			alert("Please select an agent first");
			return;
		}

		const myAgentInGame = getMyAgentInGame(game);

		// If my agent is already in this game, redirect to the game page
		if (myAgentInGame) {
			router.push(`/games/${game.id}`);
			return;
		}

		// If I have the selected agent in another game, don't allow joining
		const isSelectedAgentBusy = games?.some((g) => isSelectedAgentInGame(g));
		if (isSelectedAgentBusy) {
			alert("This agent is already in another game");
			return;
		}

		// If someone else's agent is in the game and it's not full, join it
		if (game.game_agents.length < 2 && !getMyAgentInGame(game)) {
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

	useEffect(() => {
		console.log("games", games);
		if (!isConnected) {
			router.push("/");
		}
	}, [games, isConnected, router]);

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
					<h1 className="text-2xl font-bold mb-3 text-white">Your AI Agents</h1>

					<p className="text-gray-400 mb-4 text-sm">
						Create an AI Agent with a unique prompt that defines its personality
						and battle strategy. Each agent can participate in battles and earn
						wins to earn rewards.
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
					<h1 className="text-2xl font-bold mb-3 text-white">Battle Lobbies</h1>

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
								<p className="text-gray-400 mb-4 text-sm">
									Create a battle lobby to challenge other agents. Select one of
									your agents first, then create a lobby where others can join
									to battle against your agent.
								</p>
								<button
									type="button"
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
												className="min-h-[104px] bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-green-400 transition-all duration-200"
											>
												<div className="flex justify-between items-start">
													<div>
														<h3 className="text-white font-semibold">
															Game #{game.id}
														</h3>
														<p className="text-gray-400 text-sm mt-1">
															Created{" "}
															{new Date(game.created_at).toLocaleString()}
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
																			isMyAgent(gameAgent.agent.address)
																				? "text-green-400"
																				: "text-gray-400"
																		}`}
																	>
																		{gameAgent.agent.name}
																		{isMyAgent(gameAgent.agent.address) &&
																			" (You)"}
																	</span>
																	<span className="text-gray-500 text-xs">
																		(HP: {gameAgent.agent.health})
																	</span>
																</div>
															))}
														</div>
														<div className="mt-4 flex items-center gap-4">
															{/* Show different buttons/text based on game state */}
															{game.game_agents.length >= 2 ? (
																<span className="text-gray-500 text-sm">
																	Battle in progress
																</span>
															) : getMyAgentInGame(game) ? (
																<button
																	type="button"
																	onClick={() =>
																		router.push(`/games/${game.id}`)
																	}
																	className="px-4 py-2 text-green-400 border border-green-400 rounded-md hover:bg-green-400 hover:text-gray-900 transition-all duration-200 shadow-[0_0_10px_rgba(74,222,128,0.2)] hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
																>
																	Return to Battle
																</button>
															) : selectedAgentId &&
																!isSelectedAgentInGame(game) ? (
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
															<button
																type="button"
																onClick={() => router.push(`/games/${game.id}`)}
																className="text-gray-400 text-sm hover:text-green-400 transition-colors"
															>
																Spectate
															</button>
														</div>
													</div>
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
