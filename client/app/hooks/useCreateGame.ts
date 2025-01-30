import { useMutation } from "@tanstack/react-query";

/**
 * Creates a new game
 */
export const useCreateGame = () => {
	return useMutation({
		mutationFn: async (agentId: number) => {
			const response = await fetch("/api/games", {
				method: "POST",
				body: JSON.stringify({ agentId }),
			});

			if (!response.ok) {
				throw new Error("Failed to create game");
			}

			return response.json();
		},
	});
};
