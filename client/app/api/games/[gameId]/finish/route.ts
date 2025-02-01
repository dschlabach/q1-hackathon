import { CONTRACT_ADDRESS } from "@/app/create/page";
import { serviceSupabase } from "@/database/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const walletClient = createWalletClient({
	chain: baseSepolia,
	account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
	transport: http(),
});

const ABI = [
	{
		inputs: [
			{ internalType: "address", name: "loserAddress", type: "address" },
			{ internalType: "uint256", name: "_id", type: "uint256" },
		],
		name: "destroyAgent",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address payable",
				name: "winnerAddress",
				type: "address",
			},
		],
		name: "transferFundsToWinner",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;

export async function POST(req: Request) {
	const { gameId } = await req.json();

	const game = await serviceSupabase
		.from("games")
		.select("*")
		.eq("id", gameId)
		.single();

	if (!game) {
		return new Response("Game not found", { status: 404 });
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - types from DB wrong
	if (game.status !== "finished") {
		return new Response("Game is not finished", { status: 400 });
	}

	const { data: gameAgents } = await serviceSupabase
		.from("game_agents")
		.select(`
            *,
            agents (*)
        `)
		.eq("game_id", gameId);

	const loserAgent = gameAgents?.find((ga) => ga.agents.health === 0)?.agents
		?.address;

	if (!loserAgent) {
		return new Response("Loser agent not found", { status: 404 });
	}

	// Post tx online
	await walletClient.writeContract({
		address: CONTRACT_ADDRESS,
		abi: ABI,
		functionName: "destroyAgent",
		args: [loserAgent as `0x${string}`, gameId],
	});

	const winnerAgent = gameAgents?.find(
		(ga) => ga?.agents?.health && ga.agents.health > 0,
	)?.agents?.address;

	if (!winnerAgent) {
		return new Response("Winner agent not found", { status: 404 });
	}

	// Pay out winner
	const tx = await walletClient.writeContract({
		address: CONTRACT_ADDRESS,
		abi: ABI,
		functionName: "transferFundsToWinner",
		args: [winnerAgent as `0x${string}`],
	});

	// Update hash in DB
	await serviceSupabase
		.from("games")
		.update({
			payout_hash: tx,
		})
		.eq("id", gameId);

	return { hash: tx };
}
