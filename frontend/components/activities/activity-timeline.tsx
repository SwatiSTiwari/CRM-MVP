"use client";

import { format } from "date-fns";
import { Phone, Calendar, CheckSquare, Mail, User, MoreHorizontal } from "lucide-react";

interface TimelineItem {
  type: "call" | "meeting" | "task" | "email";
  timestamp: string;
  summary: string;
  metadata: Record<string, any>;
}

interface ActivityTimelineProps {
  items: TimelineItem[];
}

const iconMap = {
  call: Phone,
  meeting: Calendar,
  task: CheckSquare,
  email: Mail,
};

const colorMap = {
  call: "bg-blue-100 text-blue-600 border-blue-200",
  meeting: "bg-purple-100 text-purple-600 border-purple-200",
  task: "bg-emerald-100 text-emerald-600 border-emerald-200",
  email: "bg-amber-100 text-amber-600 border-amber-200",
};

const labelMap = {
  call: "Call",
  meeting: "Meeting",
  task: "Task",
  email: "Email",
};

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-8 text-slate-500">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
          <Calendar className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">No activities yet</p>
        <p className="text-xs text-slate-400 mt-0.5">Log a call, schedule a meeting, or create a task</p>
      </div>
    );
  }

  return (
    <div className="relative pl-4">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />
      <div className="space-y-5">
        {items.map((item, idx) => {
          const Icon = iconMap[item.type];
          return (
            <div key={idx} className="relative flex gap-4">
              <div className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-sm ${colorMap[item.type]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 rounded-lg border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{labelMap[item.type]}</span>
                      <span className="text-xs text-slate-400">
                        {format(new Date(item.timestamp), "MMM d, yyyy · h:mm a")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{item.summary}</p>
                  </div>
                </div>
                {item.metadata.notes && (
                  <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-md px-3 py-2 border border-slate-100">
                    {item.metadata.notes}
                  </p>
                )}
                {item.type === "call" && item.metadata.duration && (
                  <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    Duration: {Math.floor(item.metadata.duration / 60)}m {item.metadata.duration % 60}s
                  </p>
                )}
                {item.type === "task" && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-700">
                      <CheckSquare className="h-3 w-3" />
                      {item.metadata.status}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
                      item.metadata.priority === "High"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : item.metadata.priority === "Low"
                        ? "bg-slate-100 text-slate-700 border-slate-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {item.metadata.priority}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
