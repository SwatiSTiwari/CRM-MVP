"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  Building2,
  Mail,
  MoreHorizontal,
  LayoutGrid,
  List,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NewLeadModal } from "@/components/leads/new-lead-modal";
import api from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

const stages = ["New", "Contacted", "Demo Scheduled", "Callback", "Converted"];

const stageColors: Record<string, string> = {
  New: "bg-slate-100 text-slate-700 border-slate-200",
  Contacted: "bg-blue-50 text-blue-700 border-blue-200",
  "Demo Scheduled": "bg-purple-50 text-purple-700 border-purple-200",
  Callback: "bg-amber-50 text-amber-700 border-amber-200",
  Converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const stageHeaderColors: Record<string, string> = {
  New: "bg-slate-100/80 border-slate-200",
  Contacted: "bg-blue-50/80 border-blue-200",
  "Demo Scheduled": "bg-purple-50/80 border-purple-200",
  Callback: "bg-amber-50/80 border-amber-200",
  Converted: "bg-emerald-50/80 border-emerald-200",
};

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: string;
  owner?: { name: string };
  source?: string;
  createdAt: string;
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string>("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["leads", { page, search, stage }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "100");
      if (search) params.append("search", search);
      if (stage) params.append("stage", stage);
      const res = await api.get(`/leads?${params.toString()}`);
      return res.data;
    },
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, newStage }: { id: string; newStage: string }) => {
      await api.patch(`/leads/${id}`, { stage: newStage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Stage updated");
    },
    onError: () => {
      toast.error("Failed to update stage");
    },
  });

  const leads: Lead[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 25));

  const filteredLeads = useMemo(() => {
    let list = leads;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q)
      );
    }
    if (stage.trim()) {
      list = list.filter((l) => l.stage === stage);
    }
    return list;
  }, [leads, search, stage]);

  const leadsByStage = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    stages.forEach((s) => (map[s] = []));
    filteredLeads.forEach((l) => {
      if (map[l.stage]) map[l.stage].push(l);
      else map["New"].push(l);
    });
    return map;
  }, [filteredLeads]);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggingId(leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    if (!draggingId) return;
    const lead = filteredLeads.find((l) => l._id === draggingId);
    if (lead && lead.stage !== newStage) {
      updateStage.mutate({ id: draggingId, newStage });
    }
    setDraggingId(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and track your sales leads</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                view === "list"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                view === "kanban"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </button>
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or company..."
            className="pl-9 border-slate-200 bg-slate-50 focus:bg-white"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <Select
            value={stage}
            onValueChange={(value) => {
              setStage(value || "");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44 border-slate-200 bg-white">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All stages</SelectItem>
              {stages.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {view === "list" ? (
        <>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 hover:bg-slate-50/70 border-b border-slate-200">
                    <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Lead</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Company</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Stage</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Source</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Owner</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                          Loading leads...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <Search className="h-5 w-5 text-slate-400" />
                          </div>
                          <p>No leads found</p>
                          <p className="text-xs text-slate-400">Try adjusting your filters or create a new lead</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead._id} className="hover:bg-slate-50/60 transition-colors group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                              <AvatarFallback className="text-blue-700 text-sm font-semibold">
                                {lead.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <Link
                                href={`/leads/${lead._id}`}
                                className="block font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate"
                              >
                                {lead.name}
                              </Link>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            {lead.company ? (
                              <>
                                <Building2 className="h-4 w-4 text-slate-400" />
                                {lead.company}
                              </>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${stageColors[lead.stage]}`}
                          >
                            {lead.stage}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{lead.source || <span className="text-slate-400">—</span>}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 border border-white">
                              <AvatarFallback className="bg-slate-200 text-slate-700 text-xs font-medium">
                                {lead.owner?.name?.slice(0, 2).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-slate-700">{lead.owner?.name || "Unassigned"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
              <span className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-900">{filteredLeads.length}</span> of{" "}
                <span className="font-medium text-slate-900">{total}</span> leads
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-slate-600">
                  Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
                  <span className="font-semibold text-slate-900">{totalPages}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Kanban View */
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 mb-3" />
              Loading leads...
            </div>
          ) : (
            <div className="flex gap-4 min-w-max">
              {stages.map((s) => {
                const stageLeads = leadsByStage[s] || [];
                return (
                  <div
                    key={s}
                    className="w-80 flex-shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, s)}
                  >
                    {/* Column header */}
                    <div
                      className={`flex items-center justify-between px-4 py-3 border-b ${stageHeaderColors[s]}`}
                    >
                      <span className="font-semibold text-slate-800 text-sm">{s}</span>
                      <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm">
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 p-3 space-y-3 min-h-[120px] bg-slate-50/40">
                      {stageLeads.map((lead) => (
                        <div
                          key={lead._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead._id)}
                          className={`group cursor-move rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
                            draggingId === lead._id ? "opacity-50" : "opacity-100"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 text-slate-300 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/leads/${lead._id}`}
                                className="block font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate text-sm"
                              >
                                {lead.name}
                              </Link>
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                              {lead.phone && (
                                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                  <Phone className="h-3 w-3" />
                                  {lead.phone}
                                </div>
                              )}
                              {lead.company && (
                                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                  <Building2 className="h-3 w-3 text-slate-400" />
                                  {lead.company}
                                </div>
                              )}
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">
                                  {format(new Date(lead.createdAt), "MMM d")}
                                </span>
                                <Avatar className="h-5 w-5 border border-white">
                                  <AvatarFallback className="bg-slate-200 text-slate-700 text-[10px] font-medium">
                                    {lead.owner?.name?.slice(0, 1).toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {stageLeads.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white py-6 text-slate-400 text-xs">
                          No leads
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <NewLeadModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={refetch} />
    </div>
  );
}
