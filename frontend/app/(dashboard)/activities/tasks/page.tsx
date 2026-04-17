"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import {
  CheckSquare,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  MoreHorizontal,
  Search,
  Plus,
  LayoutGrid,
  List,
  GripVertical,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import api from "@/lib/api";
import { CreateTaskModal } from "@/components/activities/create-task-modal";

const columns = [
  "Not Started",
  "Deferred",
  "In Progress",
  "Completed",
  "Waiting for input",
];

const statusMeta: Record<string, { label: string; color: string; header: string }> = {
  "Not Started": {
    label: "Not Started",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    header: "bg-slate-100/80 border-slate-200",
  },
  Deferred: {
    label: "Deferred",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    header: "bg-orange-50/80 border-orange-200",
  },
  "In Progress": {
    label: "In Progress",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    header: "bg-blue-50/80 border-blue-200",
  },
  Completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    header: "bg-emerald-50/80 border-emerald-200",
  },
  "Waiting for input": {
    label: "Waiting for input",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    header: "bg-purple-50/80 border-purple-200",
  },
};

const priorityMeta: Record<string, { color: string; dot: string }> = {
  High: { color: "text-rose-700 bg-rose-50 border-rose-200", dot: "bg-rose-500" },
  Normal: { color: "text-blue-700 bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  Low: { color: "text-slate-700 bg-slate-100 border-slate-200", dot: "bg-slate-400" },
};

interface Task {
  _id: string;
  title: string;
  dueDate: string;
  priority: string;
  status: string;
  linkedLeadId?: { _id: string; name: string };
  notes?: string;
  assignedTo?: { name: string };
}

function statusToColumn(status: string) {
  if (status === "Open") return "Not Started";
  return status;
}

function columnToApiValue(column: string) {
  return column;
}

function dueBadge(dueDate: string) {
  const d = new Date(dueDate);
  if (isToday(d)) return { text: "Today", className: "text-amber-700 bg-amber-50 border-amber-200" };
  if (isTomorrow(d)) return { text: "Tomorrow", className: "text-blue-700 bg-blue-50 border-blue-200" };
  if (isPast(d) && !isToday(d)) return { text: format(d, "MMM d, yyyy"), className: "text-rose-700 bg-rose-50 border-rose-200" };
  return { text: format(d, "MMM d, yyyy"), className: "text-slate-700 bg-slate-100 border-slate-200" };
}

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.get("/activities?type=task");
      return res.data.tasks as Task[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/activities/tasks/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated");
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  const displayed = tasks?.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.linkedLeadId?.name?.toLowerCase().includes(q) ||
      t.notes?.toLowerCase().includes(q) ||
      t.assignedTo?.name?.toLowerCase().includes(q)
    );
  });

  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {};
    columns.forEach((c) => (map[c] = []));
    displayed?.forEach((t) => {
      const col = statusToColumn(t.status);
      if (map[col]) map[col].push(t);
      else map["Not Started"].push(t);
    });
    return map;
  }, [displayed]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    if (!draggingId) return;
    const task = displayed?.find((t) => t._id === draggingId);
    const currentCol = task ? statusToColumn(task.status) : null;
    if (currentCol && currentCol !== column) {
      updateStatus.mutate({ id: draggingId, status: columnToApiValue(column) });
    }
    setDraggingId(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage your daily tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                view === "list" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                view === "kanban" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </button>
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            className="pl-9 border-slate-200 bg-slate-50 focus:bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {view === "list" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-10 text-slate-500 shadow-sm">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 mb-3" />
              Loading tasks...
            </div>
          ) : displayed?.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-10 text-slate-500 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <CheckSquare className="h-6 w-6 text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">No tasks found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or create a new task</p>
            </div>
          ) : (
            displayed?.map((task) => {
              const due = task.dueDate ? dueBadge(task.dueDate) : null;
              const p = priorityMeta[task.priority] || priorityMeta.Normal;
              const col = statusToColumn(task.status);
              return (
                <div
                  key={task._id}
                  className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateStatus.mutate({
                            id: task._id,
                            status: task.status === "Completed" ? "Not Started" : "Completed",
                          })
                        }
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all ${
                          task.status === "Completed"
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 hover:border-blue-500"
                        }`}
                      >
                        {task.status === "Completed" && <CheckSquare className="h-4 w-4" />}
                      </button>
                      <h3
                        className={`font-semibold text-slate-900 leading-tight ${
                          task.status === "Completed" ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 -mr-2 -mt-1">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`text-xs font-medium rounded-full border ${p.color}`}>
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${p.dot}`} />
                      {task.priority}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium rounded-full border ${statusMeta[col]?.color || "bg-slate-100 text-slate-700 border-slate-200"}`}
                    >
                      {col}
                    </Badge>
                  </div>

                  {task.linkedLeadId && (
                    <div className="mt-3 flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <AvatarFallback className="text-[10px] font-semibold text-blue-700">
                          {task.linkedLeadId.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/leads/${task.linkedLeadId._id}`}
                        className="text-sm font-medium text-slate-700 hover:text-blue-600 flex items-center gap-1 transition-colors"
                      >
                        {task.linkedLeadId.name}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 text-sm">
                      {due ? (
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${due.className}`}>
                          <Calendar className="h-3 w-3" />
                          {due.text}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">No due date</span>
                      )}
                    </div>
                    {task.assignedTo?.name && (
                      <span className="text-xs text-slate-500">{task.assignedTo.name}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 mb-3" />
              Loading tasks...
            </div>
          ) : (
            <div className="flex gap-4 min-w-max">
              {columns.map((col) => {
                const colTasks = tasksByColumn[col] || [];
                return (
                  <div
                    key={col}
                    className="w-80 flex-shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col)}
                  >
                    {/* Column header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${statusMeta[col].header}`}>
                      <span className="font-semibold text-slate-800 text-sm">{col}</span>
                      <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 p-3 space-y-3 min-h-[120px] bg-slate-50/40">
                      {colTasks.map((task) => {
                        const due = task.dueDate ? dueBadge(task.dueDate) : null;
                        const p = priorityMeta[task.priority] || priorityMeta.Normal;
                        return (
                          <div
                            key={task._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task._id)}
                            className={`group cursor-move rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
                              draggingId === task._id ? "opacity-50" : "opacity-100"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <GripVertical className="h-4 w-4 text-slate-300 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`font-semibold text-slate-900 text-sm leading-tight ${
                                    task.status === "Completed" ? "line-through text-slate-400" : ""
                                  }`}
                                >
                                  {task.title}
                                </h4>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <Badge variant="outline" className={`text-[10px] font-medium rounded-full border ${p.color}`}>
                                    <span className={`mr-1 h-1.5 w-1.5 rounded-full ${p.dot}`} />
                                    {task.priority}
                                  </Badge>
                                  {due && (
                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${due.className}`}>
                                      <Clock className="h-3 w-3" />
                                      {due.text}
                                    </span>
                                  )}
                                </div>

                                {task.linkedLeadId && (
                                  <div className="mt-2 text-xs font-medium text-slate-600">
                                    {task.linkedLeadId.name}
                                  </div>
                                )}

                                {task.assignedTo?.name && (
                                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                                    <Avatar className="h-4 w-4 border border-white">
                                      <AvatarFallback className="bg-slate-200 text-slate-700 text-[8px] font-medium">
                                        {task.assignedTo.name.slice(0, 1).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    {task.assignedTo.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {colTasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white py-6 text-slate-400 text-xs">
                          No tasks found.
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

      <CreateTaskModal open={modalOpen} onOpenChange={setModalOpen} leadId="" onSuccess={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })} />
    </div>
  );
}
