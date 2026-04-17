"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";

interface DraftEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
}

export function DraftEmailModal({ open, onOpenChange, leadName }: DraftEmailModalProps) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/draft-email", { leadName });
      setDraft(res.data.draft);
    } catch {
      toast.error("Failed to generate draft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>AI Draft Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {draft ? (
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={10} />
          ) : (
            <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">
              Click generate to create a mock email draft for {leadName}.
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Close
            </Button>
            <Button onClick={generate} disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
