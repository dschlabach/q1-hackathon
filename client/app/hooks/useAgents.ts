import { publicSupabase } from "@/database/client";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

/**
 * Fetches all agents from the database for a user
 */
export const useAgents = () => {
	const { address } = useAccount();

	return useQuery({
		queryKey: ["agents", address],
		queryFn: async () => {
			const { data, error } = await publicSupabase
				.from("agents")
				.select("*")
				.eq("address", address ?? "");
			if (error) {
				throw error;
			}
			return data;
		},
	});
};
