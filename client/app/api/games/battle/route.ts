import { openai } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import { serviceSupabase } from "@/database/server";

const ORCHESTRATOR_ID = 9999999;

/** Post will need agents initial prompt
 *  {
 *      agent1Prompt: "",
 *      agent2Prompt: ""
 *  }
 *
 *
 * will return "streamed text data, and "
 */

interface BattleRequest {
  agent1Prompt: string;
  agent2Prompt: string;
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

const BATTLE_SYSTEM_PROMPT = `You are a battle orchestrator managing a turn-based combat between two AI agents.
Rules:
- Each agent starts with 100 health
- Combat proceeds in rounds, with each agent taking turns
- Each round should describe:
  * The action taken by each agent
  * The damage dealt (between 5-25 per successful hit)
  * Current health status
- Consider special abilities based on agent descriptions
- Battle ends when one agent reaches 0 health

Respond with a JSON structure for each round:
{
  "round": number,
  "narration": "Detailed description of the round's events",
  "agent1": {
    "action": "Description of agent 1's action",
    "damageDealt": number,
    "currentHealth": number
  },
  "agent2": {
    "action": "Description of agent 2's action",
    "damageDealt": number,
    "currentHealth": number
  },
  "winner": 1 | 2 | null
}`;

async function saveGameUpdate(
  gameId: number,
  update: {
    agent_id: number | "ORCHESTRATOR";
    text: string;
    health?: number;
  }
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
}

export async function POST(req: Request) {
  try {
    const { agent1Prompt, agent2Prompt, gameId } =
      (await req.json()) as BattleRequest;

    if (!agent1Prompt || !agent2Prompt || !gameId) {
      return new Response(
        JSON.stringify({ error: "Agent prompts and gameId are required" }),
        { status: 400 }
      );
    }

    const messages: { role: "system" | "user"; content: string }[] = [
      { role: "system", content: BATTLE_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Agent 1: ${agent1Prompt}\nAgent 2: ${agent2Prompt}\n\nBegin the battle simulation!`,
      },
    ];

    const result = await generateText({
      model: openai("gpt-3.5-turbo"),
      messages,
    });

    // Use the correct method to handle the streaming response
    const fullResponse = await result.text;

    console.log("***** the response is *****", fullResponse);

    try {
      const battleData = JSON.parse(fullResponse) as BattleResponse;
      await saveGameUpdate(gameId, {
        agent_id: ORCHESTRATOR_ID,
        text: battleData.narration,
      });
      // Save Agent 1's update
      await saveGameUpdate(gameId, {
        agent_id: 1,
        text: battleData.agent1.action,
        health: battleData.agent1.currentHealth,
      });

      // Save Agent 2's update
      await saveGameUpdate(gameId, {
        agent_id: 2,
        text: battleData.agent2.action,
        health: battleData.agent2.currentHealth,
      });

      // If there's a winner, update the game status
      if (battleData.winner) {
        await serviceSupabase
          .from("games")
          .update({ status: "finished" })
          .eq("id", gameId);
      }
    } catch (error) {
      console.error("Error processing battle completion:", error);
    }

    return result;
  } catch (error) {
    console.error("Battle error:", error);
    return new Response(JSON.stringify({ error: "Failed to process battle" }), {
      status: 500,
    });
  }
}
