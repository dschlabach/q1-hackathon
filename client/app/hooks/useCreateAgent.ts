import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";

type CreateAgentParams = {
	prompt: string;
	name: string;
	id: number;
};

/**
 * Creates an agent for a user
 */
export const useCreateAgent = () => {
	const { address } = useAccount();
	return useMutation({
		mutationFn: async (params: CreateAgentParams) => {
			const response = await fetch("/api/agents", {
				method: "POST",
				body: JSON.stringify({ ...params, address }),
			});

			if (!response.ok) {
				throw new Error("Failed to create agent");
			}

			return response.json();
		},
	});
};
