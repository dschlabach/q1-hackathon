import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

/** Post will need agents initial prompt
 *  {
 *      agent1Prompt: "",
 *      agent2Prompt: ""
 *  }
 *
 *
 * will return "streamed text data, and "
 */

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log(process.env.OPENAI_API_KEY);
  const result = streamText({
    model: openai("gpt-4o"),
    messages,
  });

  return result.toDataStreamResponse();
}
