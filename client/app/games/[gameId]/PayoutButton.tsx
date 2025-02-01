import { useGamePayout } from "@/app/hooks/useGamePayout";

export default function PayoutButton({ gameId }: { gameId: number }) {
	const { mutate, isPending, data } = useGamePayout(gameId);

	return data ? (
		<a
			href={`https://sepolia.basescan.org/tx/${data}`}
			target="_blank"
			rel="noopener noreferrer"
			className="px-4 py-2 text-green-400 border border-green-400 rounded-md hover:bg-green-400 hover:text-gray-900 transition-all duration-200 shadow-[0_0_10px_rgba(74,222,128,0.2)] hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
		>
			View transaction
		</a>
	) : (
		<button
			type="button"
			onClick={() => mutate()}
			disabled={isPending}
			className={`px-4 py-2 rounded-md transition-all duration-200 ${
				isPending
					? "bg-gray-700 text-gray-500 border border-gray-600 cursor-not-allowed"
					: "text-green-400 border border-green-400 hover:bg-green-400 hover:text-gray-900 shadow-[0_0_10px_rgba(74,222,128,0.2)] hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
			}`}
		>
			{isPending ? "Collecting..." : "Collect Winnings"}
		</button>
	);
}
