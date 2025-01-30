import { serviceSupabase } from "@/database/server";

const STARTING_HEALTH = 100;

export async function POST(request: Request) {
	const { id, prompt, name, address } = await request.json();
	if (!id || !prompt || !name || !address) {
		return new Response(JSON.stringify({ error: "Missing required fields" }), {
			status: 400,
		});
	}

	const { data, error } = await serviceSupabase
		.from("agents")
		.insert({ id, prompt, health: STARTING_HEALTH, name, address });

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
		});
	}

	return new Response(JSON.stringify(data), { status: 200 });
}
