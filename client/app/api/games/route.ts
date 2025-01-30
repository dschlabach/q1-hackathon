import { serviceSupabase } from "@/database/server";
import { NextResponse } from "next/server";

/**
 * Creates a new game
 * @param request
 */
export async function POST(request: Request) {
	const { agentId } = await request.json();

	if (!agentId) {
		return NextResponse.json(
			{ error: "Agent ID is required" },
			{ status: 400 },
		);
	}

	if (typeof agentId !== "number") {
		return NextResponse.json(
			{ error: "Agent ID must be a number" },
			{ status: 400 },
		);
	}

	// Ensure agent is alive
	const { data: agent, error: agentError } = await serviceSupabase
		.from("agents")
		.select("*")
		.eq("id", agentId)
		.single();

	if (agentError) {
		return NextResponse.json({ error: agentError.message }, { status: 500 });
	}

	if (agent?.health && agent?.health <= 0) {
		return NextResponse.json({ error: "Agent is dead" }, { status: 400 });
	}

	// Check if agent is already in a game
	const { data: gameAgent, error: gameAgentError } = await serviceSupabase
		.from("game_agents")
		.select(`
			*,
			games (*)
		`)
		.eq("agent_id", agentId)
		.single();

	// TODO:  check state
	if (gameAgent) {
		return NextResponse.json(
			{ error: "Agent is already in a game" },
			{ status: 400 },
		);
	}

	// Only handle non-"not found" errors
	if (gameAgentError && gameAgentError.code !== "PGRST116") {
		return NextResponse.json(
			{ error: gameAgentError.message },
			{ status: 500 },
		);
	}

	// Create a new game
	const { data: game, error: gameError } = await serviceSupabase
		.from("games")
		.insert({
			created_at: new Date().toISOString(),
		})
		.select("*")
		.single();

	if (gameError) {
		return NextResponse.json({ error: gameError.message }, { status: 500 });
	}

	// Insert agent into game_agents
	const { error: insertError } = await serviceSupabase
		.from("game_agents")
		.insert({
			game_id: game.id,
			agent_id: agentId,
		});

	if (insertError) {
		return NextResponse.json({ error: insertError.message }, { status: 500 });
	}

	return NextResponse.json(game, { status: 201 });
}
