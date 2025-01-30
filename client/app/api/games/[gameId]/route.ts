import { serviceSupabase } from "@/database/server";
import { NextResponse } from "next/server";

export async function PATCH(
	request: Request,
	{ params }: { params: { gameId: string } },
) {
	const { gameId } = params;
	const { agentId } = await request.json();
	if (!gameId) {
		return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
	}
	if (!agentId || typeof agentId !== "number") {
		return NextResponse.json(
			{ error: "Agent ID is required and must be a number" },
			{ status: 400 },
		);
	}

	// Add agent to game_agents table
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { data: _gameAgent, error: gameAgentError } = await serviceSupabase
		.from("game_agents")
		.insert({
			game_id: Number(gameId),
			agent_id: agentId,
		});

	if (gameAgentError) {
		return NextResponse.json(
			{ error: gameAgentError.message },
			{ status: 500 },
		);
	}

	// Join the game and start it
	const { data: game, error } = await serviceSupabase
		.from("games")
		.update({
			status: "in_progress",
		})
		.eq("id", Number(gameId))
		.eq("status", "waiting") // Ensure game is still waiting
		.select()
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	// Initialize game orchestrator
	// TODO: Implement game orchestrator
	// const orchestrator = new GameOrchestrator(game_id);
	// orchestrator.startGame();

	return NextResponse.json({ game });
}
