import { serviceSupabase } from "@/database/server";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  const { agentId } = await request.json();
  if (!gameId) {
    return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
  }
  if (!agentId || typeof agentId !== "number") {
    return NextResponse.json(
      { error: "Agent ID is required and must be a number" },
      { status: 400 }
    );
  }

  console.log(gameId, agentId);
  // Add agent to game_agents table
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _gameAgent, error: gameAgentError } = await serviceSupabase
    .from("game_agents")
    .insert({
      game_id: Number(gameId),
      agent_id: agentId,
    });

  console.log("were good");

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

  const { data: gameAgents } = await serviceSupabase
    .from("game_agents")
    .select(
      `
	    agent_id,
	    agents:agent_id (
	        prompt
	    )
	`
    )
    .eq("game_id", Number(gameId));

  // Initialize game via serverless function
  await fetch(`${API_URL}/api/games/battle`, {
    method: "POST",
    body: JSON.stringify({
      gameId,
      agent1Prompt: gameAgents?.[0]?.agents?.prompt,
      agent2Prompt: gameAgents?.[1]?.agents?.prompt,
      agent1Id: gameAgents?.[0]?.agent_id,
      agent2Id: gameAgents?.[1].agent_id,
    }),
  });

  return NextResponse.json({ game });
}
