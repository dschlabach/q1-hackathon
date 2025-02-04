import { useMutation } from "@tanstack/react-query";

export function useGamePayout(gameId: number) {
	return useMutation<{ hash: `0x${string}` }>({
		mutationFn: async () => {
			const response = await fetch(`/api/games/${gameId}/finish`, {
				method: "POST",
			});
			return await response.json();
		},
	});
}
