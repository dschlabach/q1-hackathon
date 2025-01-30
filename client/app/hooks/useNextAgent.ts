import { publicSupabase } from "@/database/client";
import { useQuery } from "@tanstack/react-query";

/**
 * Gets the next agent ID to use
 */
export const useNextAgent = () => {
	return useQuery({
		queryKey: ["next-agent"],
		queryFn: async () => {
			const { data } = await publicSupabase
				.from("agents")
				.select("id")
				.order("id", { ascending: false })
				.limit(1);

			if (!data) {
				throw new Error("Error fetching next agent ID");
			}

			return data?.[0]?.id + 1;
		},
	});
};
