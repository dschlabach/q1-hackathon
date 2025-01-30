import { useEffect, useState } from "react";
import { publicSupabase } from "@/database/client";

/**
 * Streams game events from the Supabase realtime API
 * @param gameId - The ID of the game to fetch
 * @returns The game data
 */
export const useGame = (gameId: string) => {
	const [game, setGame] = useState(null);

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
					setGame(payload);
				},
			)
			.subscribe();

		return () => {
			publicSupabase.removeChannel(channel);
		};
	}, [gameId]);

	return game;
};
