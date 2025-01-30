import { publicSupabase } from "@/database/client";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches a list of all the games that are active
 */
export const useGames = () => {
	return useQuery({
		queryKey: ["games"],
		queryFn: async () => {
			const { data, error } = await publicSupabase
				.from("games")
				.select("*")
				.neq("status", "finished");

			if (error) {
				throw error;
			}
			return data;
		},
	});
};
