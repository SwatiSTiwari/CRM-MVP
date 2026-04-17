"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Button,
} from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import api from "@/lib/api";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { LogCallModal } from "@/components/activities/log-call-modal";
import { ScheduleMeetingModal } from "@/components/activities/schedule-meeting-modal";
import { CreateTaskModal } from "@/components/activities/create-task-modal";
import { DraftEmailModal } from "@/components/ai/draft-email-modal";
import { Phone, Mail, Building2, Calendar, Clock, ArrowLeft, Edit2, Check, X, PhoneCall, Video, CheckSquare, Sparkles } from "lucide-react";
import Link from "next/link";

const stages = ["New", "Contacted", "Demo Scheduled", "Callback", "Converted"];

const stageColors: Record<string, string> = {
  New: "bg-slate-100 text-slate-700 border-slate-200",
  Contacted: "bg-blue-50 text-blue-700 border-blue-200",
  "Demo Scheduled": "bg-purple-50 text-purple-700 border-purple-200",
  Callback: "bg-amber-50 text-amber-700 border-amber-200",
  Converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  stage: string;
  owner?: { name: string };
  createdAt: string;
  updatedAt: string;
}

export default function LeadDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Lead>>({});
  const [callOpen, setCallOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const res = await api.get(`/leads/${id}`);
      return res.data as Lead;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (lead) {
      setForm(lead);
    }
  }, [lead]);

  const { data: timeline, refetch: refetchTimeline } = useQuery({
    queryKey: ["timeline", id],
    queryFn: async () => {
      const res = await api.get(`/activities/timeline?leadId=${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<Lead>) => {
      const res = await api.patch(`/leads/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead updated");
      setEditing(false);
    },
    onError: () => {
      toast.error("Failed to update lead");
    },
  });

  if (isLoading || !lead) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 mr-3" />
        Loading lead details...
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/leads" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </Link>
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-md bg-gradient-to-br from-blue-100 to-indigo-100">
            <AvatarFallback className="text-blue-700 text-xl font-bold">
              {lead.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={`text-sm font-medium px-3 py-0.5 rounded-full ${stageColors[lead.stage]}`}
              >
                {lead.stage}
              </Badge>
              {lead.company && (
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {lead.company}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <Button
              variant="outline"
              onClick={() => setEditing(true)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Lead
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setForm(lead);
                }}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={() => updateMutation.mutate(form)}
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left panel — Lead info */}
        <div className="lg:col-span-1 space-y-5">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-semibold text-slate-900">Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</Label>
                {editing ? (
                  <Input
                    value={form.email || ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="border-slate-200 bg-white focus-visible:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-800">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {lead.email}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</Label>
                {editing ? (
                  <Input
                    value={form.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="border-slate-200 bg-white focus-visible:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-800">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {lead.phone || <span className="text-slate-400">—</span>}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Company</Label>
                {editing ? (
                  <Input
                    value={form.company || ""}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="border-slate-200 bg-white focus-visible:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-800">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {lead.company || <span className="text-slate-400">—</span>}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Source</Label>
                {editing ? (
                  <Input
                    value={form.source || ""}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="border-slate-200 bg-white focus-visible:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-slate-800">{lead.source || <span className="text-slate-400">—</span>}</div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Stage</Label>
                {editing ? (
                  <Select
                    value={form.stage || "New"}
                    onValueChange={(value) => setForm({ ...form, stage: value || undefined })}
                  >
                    <SelectTrigger className="border-slate-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant="outline"
                    className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${stageColors[lead.stage]}`}
                  >
                    {lead.stage}
                  </Badge>
                )}
              </div>
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Created</div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-700">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {format(new Date(lead.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Updated</div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-700">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {format(new Date(lead.updatedAt), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panel — Activity timeline */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button variant="outline" onClick={() => setCallOpen(true)} className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 justify-start">
                  <PhoneCall className="mr-2 h-4 w-4 text-blue-600" />
                  Log Call
                </Button>
                <Button variant="outline" onClick={() => setMeetingOpen(true)} className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 justify-start">
                  <Video className="mr-2 h-4 w-4 text-purple-600" />
                  Meeting
                </Button>
                <Button variant="outline" onClick={() => setTaskOpen(true)} className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 justify-start">
                  <CheckSquare className="mr-2 h-4 w-4 text-emerald-600" />
                  Task
                </Button>
                <Button variant="outline" onClick={() => setDraftOpen(true)} className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 justify-start">
                  <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                  AI Email
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-semibold text-slate-900">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <ActivityTimeline items={timeline || []} />
            </CardContent>
          </Card>
        </div>
      </div>

      <LogCallModal open={callOpen} onOpenChange={setCallOpen} leadId={String(id)} onSuccess={refetchTimeline} />
      <ScheduleMeetingModal open={meetingOpen} onOpenChange={setMeetingOpen} leadId={String(id)} onSuccess={refetchTimeline} />
      <CreateTaskModal open={taskOpen} onOpenChange={setTaskOpen} leadId={String(id)} onSuccess={refetchTimeline} />
      <DraftEmailModal open={draftOpen} onOpenChange={setDraftOpen} leadName={lead.name} />
    </div>
  );
}
