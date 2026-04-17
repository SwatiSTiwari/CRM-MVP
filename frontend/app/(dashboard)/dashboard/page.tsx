"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckSquare, Phone, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

interface TodayData {
  tasks: { title: string; dueDate: string; status: string }[];
  calls: { duration: number; direction: string }[];
  meetings: { title: string; dateTime: string }[];
}

interface PipelineData {
  New: number;
  Contacted: number;
  "Demo Scheduled": number;
  Callback: number;
  Converted: number;
}

export default function DashboardPage() {
  const { data: today } = useQuery({
    queryKey: ["dashboard-today"],
    queryFn: async () => {
      const res = await api.get("/dashboard/today");
      return res.data as TodayData;
    },
  });

  const { data: pipeline } = useQuery({
    queryKey: ["dashboard-pipeline"],
    queryFn: async () => {
      const res = await api.get("/dashboard/pipeline");
      return res.data as PipelineData;
    },
  });

  const stages = ["New", "Contacted", "Demo Scheduled", "Callback", "Converted"] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{today?.tasks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Due today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{today?.calls?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Logged today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{today?.meetings?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {stages.map((stage, idx) => (
              <div key={stage} className="flex items-center gap-2">
                <div className="flex flex-col items-center rounded-md border px-4 py-2">
                  <span className="text-xs text-muted-foreground">{stage}</span>
                  <span className="text-lg font-semibold">
                    {pipeline?.[stage] || 0}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
