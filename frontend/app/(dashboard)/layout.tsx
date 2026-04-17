import { Sidebar, MobileSidebar } from "@/components/sidebar";
import { AiFab } from "@/components/ai/ai-fab";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-slate-200 bg-white px-4 lg:px-6 shadow-sm">
          <MobileSidebar />
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              Z
            </div>
            <span className="font-semibold text-slate-900">CRM MVP</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
      <AiFab />
    </div>
  );
}
