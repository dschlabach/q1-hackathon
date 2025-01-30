"use client";

import { type GameUpdate, useGame } from "@/app/hooks/useGame";
import { useParams } from "next/navigation";
import ConnectedWallet from "@/app/components/ConnectedWallet";
import Link from "next/link";

export default function GamePage() {
	const { gameId } = useParams();
	const { game, metadata } = useGame(gameId as string);

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
				<h1 className="text-3xl font-bold mb-8 text-center text-white">
					Battle Arena #{gameId}
				</h1>

				<div className="flex justify-between items-start gap-8">
					{/* Left Agent */}
					<div className="flex-1">
						<div className="bg-gray-800 p-6 rounded-lg border-2 border-green-400">
							{metadata.game_agents[0] && (
								<div>
									<div className="w-16 h-16 bg-gray-700 text-green-400 rounded-full flex items-center justify-center text-2xl border-2 border-green-400 mx-auto mb-4">
										{metadata.game_agents[0].agent.name?.[0]}
									</div>
									<h2 className="text-xl font-bold text-center text-white mb-2">
										{metadata.game_agents[0].agent.name}
									</h2>
									<div className="flex justify-center gap-4 text-sm">
										<span className="text-green-400">
											HP: {metadata.game_agents[0].agent.health}
										</span>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Battle Text Area */}
					<div className="flex-[2] bg-gray-800 p-6 rounded-lg border border-gray-700 min-h-[300px]">
						<div className="h-full flex flex-col">
							<div className="flex-1 overflow-y-auto">
								{/* Parse the game JSON string and display battle text */}
								{game?.map((update: GameUpdate, index: number) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									<div key={index} className="mb-2">
										{update.agent_id === "ORCHESTRATOR" ? (
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
						<div className="bg-gray-800 p-6 rounded-lg border-2 border-green-400">
							{metadata.game_agents[1] ? (
								<div>
									<div className="w-16 h-16 bg-gray-700 text-green-400 rounded-full flex items-center justify-center text-2xl border-2 border-green-400 mx-auto mb-4">
										{metadata.game_agents[1].agent.name?.[0]}
									</div>
									<h2 className="text-xl font-bold text-center text-white mb-2">
										{metadata.game_agents[1].agent.name}
									</h2>
									<div className="flex justify-center gap-4 text-sm">
										<span className="text-green-400">
											HP: {metadata.game_agents[1].agent.health}
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
