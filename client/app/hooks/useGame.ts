import { useEffect, useState } from "react";
import { publicSupabase } from "@/database/client";

const TEST_GAME_JSON = JSON.stringify([
	{
		agent_id: 1,
		text: "this is some text for a round",
		health: 100,
	},
	{
		agent_id: 2,
		text: "this is some text for a round",
		health: 90,
	},
	{
		agent_id: "ORCHESTRATOR",
		text: "ORCHESTRATOR text",
	},
]);

/**
 * Streams game events from the Supabase realtime API
 * @param gameId - The ID of the game to fetch
 * @returns The game data
 */
export const useGame = (gameId: string) => {
	const [game, setGame] = useState(TEST_GAME_JSON);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const channel = publicSupabase
			.channel(`game_${gameId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "game_updates",
					filter: `game_id=eq.${gameId}`,
				},
				(payload) => {
					console.log("payload:", payload);
					setGame([...game, payload]);
				},
			)
			.subscribe();

		return () => {
			publicSupabase.removeChannel(channel);
		};
	}, [gameId]);

	return game;
};
