"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import { resolve } from "path";
// import { Stock } from '@ai-studio/components/stock';
// import { Flight } from '@ai-studio/components/flight';

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

export async function continueConversation(
  input: string
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();

  const result = await streamUI({
    model: openai("gpt-4o"),
    system:
      "you are a spotify api expert and you are helping me add song playback when i ask you to play a song",
    messages: [...history.get(), { role: "user", content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "assistant", content },
        ]);
      }
      return <div>{content}</div>;
    },
    tools: {
      celsiusToFahrenheit: {
        description: "Converts celsius to fahrenheit",
        parameters: z.object({
          value: z.string().describe("The value in celsius"),
        }),
        generate: async function* ({ value }) {
          yield <div>Waiting for the result...</div>;
          const celsius = parseFloat(value);
          const fahrenheit = celsius * (9 / 5) + 32;
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return (
            <div className="bg-blue-800 rounded-full p-4">
              ${celsius}°C is ${fahrenheit.toFixed(2)}°F
            </div>
          );
        },
      },
    },
  });

  return {
    id: nanoid(),
    role: "assistant",
    display: result.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});
