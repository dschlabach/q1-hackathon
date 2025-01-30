import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useJoinGame = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			gameId,
			agentId,
		}: { gameId: string; agentId: number }) => {
			const response = await fetch(`/api/games/${gameId}`, {
				method: "PATCH",
				body: JSON.stringify({ agentId }),
			});

			if (!response.ok) {
				throw new Error("Failed to join game");
			}

			return response.json();
		},
		onSuccess: (_, { gameId }) => {
			queryClient.invalidateQueries({ queryKey: ["game", gameId] });
		},
	});
};
