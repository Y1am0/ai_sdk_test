"use client";

import { useState } from "react";
import { ClientMessage } from "@/app/actions";
import { useActions, useUIState } from "ai/rsc";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div>
        {conversation.map((message: ClientMessage) => (
          <div key={message.id} className="whitespace-pre-wrap">
            {message.role}: {message.display}
          </div>
        ))}
      </div>

      <form
        action={async () => {
          setInput("");

          const message = await continueConversation(input);

          setConversation((currentConversation: ClientMessage[]) => [
            ...currentConversation,
            message,
          ]);
        }}
      >
        <input
          className="text-black fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
          }}
        />
      </form>
    </div>
  );
}
