import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/app/constants";
import { serviceSupabase } from "@/database/server";
import { NextResponse } from "next/server";
import { createWalletClient, http, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { waitForTransactionReceipt } from "viem/actions";
import { baseSepolia } from "viem/chains";

const walletClient = createWalletClient({
	chain: baseSepolia,
	account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
	transport: http(),
});

export async function POST(
	req: Request,
	{ params }: { params: { gameId: string } },
) {
	console.log("executing from", walletClient.account.address);

	const { gameId: gameIdStr } = await params;
	const gameId = Number(gameIdStr);

	const { data: game } = await serviceSupabase
		.from("games")
		.select("*")
		.eq("id", gameId)
		.single();

	if (!game) {
		return new Response("Game not found", { status: 404 });
	}

	if (game.status !== "finished") {
		return new Response("Game is not finished", { status: 400 });
	}

	const { data: gameAgents } = await serviceSupabase
		.from("game_agents")
		.select(
			`
            *,
            agents (*)
        `,
		)
		.eq("game_id", gameId);

	const loserAgent = gameAgents?.find((ga) => ga.agents.health === 0)?.agents
		?.address;

	if (!loserAgent) {
		return new Response("Loser agent not found", { status: 404 });
	}

	// Post tx online
	const destroyAgentTx = await walletClient.writeContract({
		address: CONTRACT_ADDRESS,
		abi: CONTRACT_ABI,
		functionName: "destroyAgent",
		args: [loserAgent as `0x${string}`, BigInt(gameIdStr)],
	});

	const destroyAgentReceipt = await waitForTransactionReceipt(walletClient, {
		hash: destroyAgentTx,
	});

	console.log("destroyAgentReceipt", destroyAgentReceipt);

	const winnerAgent = gameAgents?.find(
		(ga) => ga?.agents?.health && ga.agents.health > 0,
	)?.agents?.address;

	if (!winnerAgent || !isAddress(winnerAgent)) {
		console.log("winner agent is not found");
		return new Response("Winner agent not found", { status: 404 });
	}

	// Pay out winner
	const tx = await walletClient.writeContract({
		address: CONTRACT_ADDRESS,
		abi: CONTRACT_ABI,
		functionName: "transferFundsToWinner",
		args: [winnerAgent],
	});

	// Update hash in DB
	await serviceSupabase
		.from("games")
		.update({
			payout_hash: tx,
		})
		.eq("id", gameId);

	return NextResponse.json({ hash: tx });
}
