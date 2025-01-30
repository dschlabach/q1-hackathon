import { useEffect, useState } from "react";
import { publicSupabase } from "@/database/client";
import { useQuery } from "@tanstack/react-query";

export type GameUpdate = {
	agent_id: number;
	text: string;
	health?: number;
};

/**
 * Streams game events from the Supabase realtime API
 * @param gameId - The ID of the game to fetch
 * @returns The game data
 */
export const useGame = (gameId: string) => {
	const [game, setGame] = useState<GameUpdate[]>([]);

	const { data: metadata } = useQuery({
		queryKey: ["games", gameId],
		queryFn: async () => {
			const { data, error } = await publicSupabase
				.from("games")
				.select(`
					*,
					game_agents (
						*,
						agent: agents (*)
					)
				`)
				.eq("id", Number(gameId))
				.single();

			if (error) {
				throw error;
			}
			return data;
		},
	});

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
					setGame([...game, payload as unknown as GameUpdate]);
				},
			)
			.subscribe();

		return () => {
			publicSupabase.removeChannel(channel);
		};
	}, [gameId]);

	return { game, metadata };
};
