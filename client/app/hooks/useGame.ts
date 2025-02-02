import { useState, useEffect } from "react";
import { publicSupabase } from "@/database/client";
import { useQuery } from "@tanstack/react-query";

export type GameUpdate = {
  agent_id: number;
  text: string;
  health?: number;
};

type Payload = {
  new: {
    agent_id: number;
    health: number;
  };
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
        .select(
          `
					*,
					game_agents (
						*,
						agent: agents (*)
					)
				`
        )
        .eq("id", Number(gameId))
        .single();

      if (error) {
        throw error;
      }
      return data;
    },
    refetchInterval: 1_000, // every second
  });

  const { data: gameHistory } = useQuery({
    queryKey: ["game_updates", gameId],
    queryFn: async () => {
      const { data } = await publicSupabase
        .from("game_updates")
        .select("*")
        .eq("game_id", Number(gameId));
      return (data as NonNullable<GameUpdate>[]) ?? [];
    },
  });

  useEffect(() => {
    const channel = publicSupabase
      .channel("game_updates")
      .on(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_updates",
          filter: `game_id=eq.${gameId}`,
        },
        (payload: Payload) => {
          setGame((current) => [
            ...current,
            payload.new as unknown as GameUpdate,
          ]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [gameId]);

  // If the game is finished and there are no saved live updates, return the archived game
  const shouldReturnArchivedGame = metadata?.status === "finished" && !game;

  return {
    game: shouldReturnArchivedGame
      ? gameHistory ?? ([] as GameUpdate[])
      : (game as GameUpdate[]),
    metadata,
  };
};
