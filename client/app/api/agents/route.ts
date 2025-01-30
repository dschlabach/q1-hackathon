import { serviceSupabase } from "@/database/server";

const STARTING_HEALTH = 100;

export async function POST(request: Request) {
	const { id, address, prompt, name } = await request.json();
	if (!id || !address || !prompt || !name) {
		return new Response(JSON.stringify({ error: "Missing required fields" }), {
			status: 400,
		});
	}

	const { data, error } = await serviceSupabase
		.from("agents")
		.insert({ id, prompt, health: STARTING_HEALTH, address, name });

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
		});
	}

	return new Response(JSON.stringify(data), { status: 200 });
}
