"use client";

import { useGame } from "@/app/hooks/useGame";
import { useParams } from "next/navigation";

export default function GamePage() {
	const { gameId } = useParams();
	const game = useGame(gameId as string);

	return <div>Game {gameId}</div>;
}
