"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId?: string;
  onSuccess: () => void;
}

const priorities = ["High", "Normal", "Low"];
const statuses = ["Not Started", "Deferred", "In Progress", "Completed", "Waiting for input"];

export function CreateTaskModal({ open, onOpenChange, leadId, onSuccess }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState("Normal");
  const [status, setStatus] = useState("Not Started");
  const [notes, setNotes] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState(leadId || "");
  const [loading, setLoading] = useState(false);

  const { data: leadsData } = useQuery({
    queryKey: ["leads", "dropdown"],
    queryFn: async () => {
      const res = await api.get("/leads?limit=100");
      return res.data.data as { _id: string; name: string }[];
    },
    enabled: open && !leadId,
  });

  useEffect(() => {
    if (open) {
      setSelectedLeadId(leadId || "");
    }
  }, [open, leadId]);

  const reset = () => {
    setTitle("");
    setDueDate(new Date().toISOString().slice(0, 10));
    setPriority("Normal");
    setStatus("Not Started");
    setNotes("");
    setSelectedLeadId(leadId || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) {
      toast.error("Please select a lead");
      return;
    }
    setLoading(true);
    try {
      await api.post("/activities/task", {
        linkedLeadId: selectedLeadId,
        title,
        dueDate: new Date(dueDate).toISOString(),
        priority,
        status,
        notes,
      });
      toast.success("Task created successfully");
      reset();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium text-slate-700">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-slate-200 bg-white focus-visible:ring-blue-500"
              placeholder="e.g. Follow-up call"
            />
          </div>

          {!leadId && (
            <div className="space-y-1.5">
              <Label htmlFor="lead" className="text-sm font-medium text-slate-700">Related Lead *</Label>
              <Select value={selectedLeadId} onValueChange={(v) => setSelectedLeadId(v || "")}>
                <SelectTrigger id="lead" className="w-full border-slate-200 bg-white">
                  <SelectValue>
                    {selectedLeadId
                      ? leadsData?.find((l) => l._id === selectedLeadId)?.name || "Selected lead"
                      : "Select a lead"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" " disabled>
                    Select a lead
                  </SelectItem>
                  {leadsData?.map((lead) => (
                    <SelectItem key={lead._id} value={lead._id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-sm font-medium text-slate-700">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="border-slate-200 bg-white focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority" className="text-sm font-medium text-slate-700">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v || "Normal")}>
                <SelectTrigger id="priority" className="border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-sm font-medium text-slate-700">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v || "Not Started")}>
              <SelectTrigger id="status" className="border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm font-medium text-slate-700">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-slate-200 bg-white focus-visible:ring-blue-500 min-h-[80px]"
              placeholder="Add details about this task..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="border-slate-200 text-slate-700 hover:bg-slate-50">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Saving..." : "Save Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
