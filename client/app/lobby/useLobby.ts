import { publicSupabase } from "@/database/client";
import React from "react";
import { useAccount } from "wagmi";

/**
 * Handles adding users to the lobby and fetching real-time lobby members
 * @returns
 */
export const useLobby = () => {
	const [users, setUsers] = React.useState<string[]>([]);
	const { address } = useAccount();

	const fetchUsers = async () => {
		const { data, error } = await publicSupabase.from("lobby").select("*");

		if (error) {
			console.error("Error fetching users:", error);
		} else {
			setUsers(data.map((user) => user.address));
		}
	};

	// Create a function to handle inserts
	const handleInserts = (payload: unknown) => {
		console.log("Change received!", payload);
	};

	// Create a function to handle deletes
	const handleDeletes = (payload: unknown) => {
		console.log("Delete received!", payload);
		// Refresh users list
		fetchUsers();
	};

	// Listen to inserts and deletes
	const channel = publicSupabase
		.channel("lobby")
		.on(
			"postgres_changes",
			{ event: "INSERT", schema: "public", table: "lobby" },
			handleInserts,
		)
		.on(
			"postgres_changes",
			{ event: "DELETE", schema: "public", table: "lobby" },
			handleDeletes,
		)
		.subscribe();

	React.useEffect(() => {
		fetchUsers();

		if (!address) return;

		// Add player to lobby
		fetch("/api/lobby", {
			method: "POST",
			body: JSON.stringify({ address }),
		});

		// Cleanup function
		return () => {
			// Remove player from lobby
			fetch("/api/games/lobby", {
				method: "DELETE",
				body: JSON.stringify({ address }),
			});

			// Unsubscribe from Supabase channel
			channel.unsubscribe();
		};
	}, [address]);

	return { users };
};
