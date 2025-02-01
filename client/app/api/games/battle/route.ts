import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { serviceSupabase } from "@/database/server";
import { z } from "zod";
export const maxDuration = 60;

const ORCHESTRATOR_ID = 9999999;

interface BattleRequest {
	agent1Prompt: string;
	agent2Prompt: string;
	agent1Id: number;
	agent2Id: number;
	gameId: number;
}

interface AgentStatus {
	action: string;
	damageDealt: number;
	currentHealth: number;
}

interface BattleResponse {
	narration: string;
	agent1: AgentStatus;
	agent2: AgentStatus;
	winner?: 1 | 2;
}

async function saveGameUpdate(
	gameId: number,
	update: {
		agent_id: number | "ORCHESTRATOR";
		text: string;
		health?: number;
	},
) {
	const { error } = await serviceSupabase.from("game_updates").insert({
		game_id: gameId,
		agent_id:
			update.agent_id === "ORCHESTRATOR" ? ORCHESTRATOR_ID : update.agent_id,
		text: update.text,
		health: update.health,
	});

	if (error) {
		console.error("Error saving game update:", error);
		throw error;
	}

	// Update health on agents table
	const { error: agentError } = await serviceSupabase
		.from("agents")
		.update({ health: update.health })
		.eq(
			"id",
			update.agent_id === "ORCHESTRATOR" ? ORCHESTRATOR_ID : update.agent_id,
		);

	if (agentError) {
		console.error("Error updating agent health:", agentError);
		throw agentError;
	}
}

export async function POST(req: Request) {
	try {
		const { agent1Prompt, agent2Prompt, gameId, agent1Id, agent2Id } =
			(await req.json()) as BattleRequest;

		if (!agent1Prompt || !agent2Prompt || !gameId) {
			return new Response(
				JSON.stringify({ error: "Agent prompts and gameId are required" }),
				{ status: 400 },
			);
		}

		const BATTLE_SYSTEM_PROMPT = `You are a battle orchestrator managing a turn-based combat between two AI agents.
Rules:
- Each agent starts with 100 health
- But the health must decrement so you will need to know the health of the last state for each agent. Health should never go back to 100 after being dealt damage.
- Combat proceeds in rounds, with each agent taking turns
- Each round should describe:
  * The action taken by each agent
  * The damage dealt (between 15-30 per successful hit)
  * Current health status
- Consider special abilities based on agent descriptions
- Battle ends when one agent reaches 0 health
- If the battle is not finished, continue the battle
- If the battle is finished, return the winner
- Never deal 0 damage
- Damage must ALWAYS be dealt!
- HEALTH CAN NEVER INCREASE - THIS IS VERY IMPORTANT. IF AN AGENT DOESN'T TAKE DAMAGE, LEAVE HEALTH THE SAME. 
- You MUST always decrease an agents health, either one or both but someones health must be decreased and that decreased health returned the in the resposne this is non negtoiable.
- Preferably this is no longer than 10 rounds but it is okay to go to 15.

Respond with a JSON structure for each round:
{
  "round": number,
  "narration": "Detailed description of the round's events",
  agent1: {
    "action": "Description of agent 1's action",
    "damageDealt": number,
    "currentHealth": number
  },
 agent2: {
    "action": "Description of agent 2's action",
    "damageDealt": number,
    "currentHealth": number
  },
  "winner": 1 | 2 | null
}`;

		let agent1Health = 100;
		let agent2Health = 100;
		let round = 1;

		while (agent1Health > 0 && agent2Health > 0) {
			const messages: { role: "system" | "user"; content: string }[] = [
				{ role: "system", content: BATTLE_SYSTEM_PROMPT },
				{
					role: "user",
					content: `Round ${round}\nAgent 1: ${agent1Prompt}\nAgent 2: ${agent2Prompt}\n\nBegin the battle simulation!`,
				},
			];

			const result = await generateObject({
				model: openai("gpt-4o"),
				messages,
				schema: z.object({
					round: z.number(),
					narration: z.string(),
					agent1: z.object({
						action: z.string(),
						damageDealt: z.number(),
						currentHealth: z.number(),
					}),
					agent2: z.object({
						action: z.string(),
						damageDealt: z.number(),
						currentHealth: z.number(),
					}),
					winner: z.number().nullable(),
				}),
			});

			const fullResponse = result.object;
			console.log("***** the response is *****", fullResponse);

			try {
				const battleData = fullResponse as BattleResponse;
				await saveGameUpdate(gameId, {
					agent_id: ORCHESTRATOR_ID,
					text: battleData.narration,
				});

				// Update health based on the response
				agent1Health = battleData.agent1.currentHealth;
				agent2Health = battleData.agent2.currentHealth;

				// Save Agent 1's update
				await saveGameUpdate(gameId, {
					agent_id: agent1Id,
					text: battleData.agent1.action,
					health: agent1Health,
				});

				// Save Agent 2's update
				await saveGameUpdate(gameId, {
					agent_id: agent2Id,
					text: battleData.agent2.action,
					health: agent2Health,
				});

				// If there's a winner, update the game status
				if (battleData.winner) {
					await serviceSupabase
						.from("games")
						.update({ status: "finished" })
						.eq("id", gameId);
					break;
				}
			} catch (error) {
				console.error("Error processing battle completion:", error);
				break;
			}

			round++;
		}

		return new Response(JSON.stringify({ message: "Battle completed" }), {
			status: 200,
		});
	} catch (error) {
		console.error("Battle error:", error);
		return new Response(JSON.stringify({ error: "Failed to process battle" }), {
			status: 500,
		});
	}
}
