import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Creates a new game
 */
export const useCreateGame = () => {
	const queryClient = useQueryClient();
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
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["games"] });
			queryClient.invalidateQueries({ queryKey: ["game", data.id] });
		},
	});
};
