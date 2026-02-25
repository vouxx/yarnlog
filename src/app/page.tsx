import KanbanBoard from "@/components/KanbanBoard";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-warm-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-warm-800 tracking-tight">
            뜨개노트
          </h1>
          <p className="text-sm text-warm-400">내 뜨개질 프로젝트 관리</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto">
        <KanbanBoard />
      </main>
    </div>
  );
}
