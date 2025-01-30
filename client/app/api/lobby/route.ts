import { serviceSupabase } from "@/database/server";
import { NextResponse } from "next/server";

/**
 * Gets all users in the lobby
 * @returns all users in the lobby
 */
export async function GET() {
	const { data, error } = await serviceSupabase.from("lobby").select("*");

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ data });
}

/**
 * Adds a user to the lobby
 * @param request address
 */
export async function POST(request: Request) {
	console.log("POST request received");
	const { address } = await request.json();

	if (!address) {
		return NextResponse.json({ error: "Address is required" }, { status: 400 });
	}

	const { data, error } = await serviceSupabase.from("lobby").insert({
		address,
	});

	if (error) {
		console.log("error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ data });
}
