"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiChatPanel } from "./ai-chat-panel";

export function AiFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <Bot className="h-6 w-6" />
      </Button>
      <AiChatPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
