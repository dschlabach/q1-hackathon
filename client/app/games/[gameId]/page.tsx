"use client";

import { type GameUpdate, useGame } from "@/app/hooks/useGame";
import { useParams } from "next/navigation";
import ConnectedWallet from "@/app/components/ConnectedWallet";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useAgentSelection } from "@/app/hooks/useAgentSelection";
import BattleAgentCard from "@/app/components/BattleAgentCard";

const getGameWinner = (game: GameUpdate[]) => {
	const lastUpdate = game.findLast(
		(update) => update.agent_id !== ORCHESTRATOR_ID,
	);
	if (!lastUpdate) {
		return null;
	}

	// If one of the agents is dead, the other agent wins
	if (lastUpdate.health === 0) {
		// return the other agent id
		return game.find(
			(update) =>
				update.agent_id !== lastUpdate.agent_id &&
				update.agent_id !== ORCHESTRATOR_ID,
		)?.agent_id;
	}
	return null;
};

const ORCHESTRATOR_ID = 9999999;

export default function GamePage() {
	const { gameId } = useParams();
	const { game, metadata } = useGame(gameId as string);
	const { address } = useAccount();
	const { isMyAgent } = useAgentSelection();
	const winner = getGameWinner(game as GameUpdate[]);
	const winnerName =
		metadata?.game_agents.find((ga) => ga.agent.id === winner)?.agent.name ??
		"Unknown";

	if (!metadata) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-900">
				<div className="text-green-400">Loading battle...</div>
			</div>
		);
	}

	// Shared props for left agent
	const leftAgentProps = {
		agent: metadata.game_agents[0],
		isMyAgent: metadata.game_agents[0]
			? isMyAgent(metadata.game_agents[0].agent.address, address)
			: false,
		currentHealth: game.findLast(
			(update) => update.agent_id === metadata.game_agents[0]?.agent.id,
		)?.health,
	};

	// Shared props for right agent
	const rightAgentProps = {
		agent: metadata.game_agents[1],
		isMyAgent: metadata.game_agents[1]
			? isMyAgent(metadata.game_agents[1].agent.address, address)
			: false,
		currentHealth: game.findLast(
			(update) => update.agent_id === metadata.game_agents[1]?.agent.id,
		)?.health,
	};

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
					isMyAgent(ga.agent.address, address),
				) && (
					<div className="text-gray-500 text-center mb-2 italic">
						Spectating
					</div>
				)}
				<h1 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-6 text-center text-white">
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

				<div className="flex flex-col sm:flex-row justify-between items-start gap-4">
					{/* Agents Container for mobile only */}
					<div className="flex w-full gap-4 sm:hidden">
						{/* Left Agent - Mobile */}
						<div className="flex-1">
							<BattleAgentCard {...leftAgentProps} />
						</div>

						{/* Right Agent - Mobile */}
						<div className="flex-1">
							<BattleAgentCard {...rightAgentProps} />
						</div>
					</div>

					{/* Left Agent - Desktop */}
					<div className="hidden sm:block sm:flex-1">
						<BattleAgentCard {...leftAgentProps} />
					</div>

					{/* Battle Text Area */}
					<div className="w-full sm:flex-[2] bg-gray-800 p-4 rounded-lg border border-gray-700 min-h-[300px] max-h-[60vh] overflow-y-auto">
						<div className="h-full flex flex-col">
							<div className="flex-1 overflow-y-auto">
								{/* Parse the game JSON string and display battle text */}
								{game?.map((update: GameUpdate, index: number) => {
									const agentName =
										metadata.game_agents.find(
											(ga) => ga.agent.id === update.agent_id,
										)?.agent.name ?? `Agent ${update.agent_id}`;
									return (
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										<div key={index} className="mb-2">
											{update.agent_id === ORCHESTRATOR_ID ? (
												<p className="text-yellow-400 text-center">
													{update.text}
												</p>
											) : (
												<p className="text-green-400">
													{agentName}: {update.text}
													{update.health !== undefined &&
														` (HP: ${update.health})`}
												</p>
											)}
										</div>
									);
								})}
							</div>
							<div className="text-gray-400 text-center mt-4">
								{metadata.game_agents.length < 2
									? "Waiting for opponent..."
									: metadata.status === "finished"
										? `Game over! ${winnerName} wins!`
										: "Battle in progress..."}
							</div>
						</div>
					</div>

					{/* Right Agent - Desktop */}
					<div className="hidden sm:block sm:flex-1">
						<BattleAgentCard {...rightAgentProps} />
					</div>
				</div>
			</div>
		</main>
	);
}
