"use client";

import { useParams } from "next/navigation";

export default function GamePage() {
	const { gameId } = useParams();

	return <div>Game {gameId}</div>;
}
