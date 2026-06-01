export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="bg-white shadow-sm dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Painel Administrativo Revere
          </h1>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Placeholder
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg border-4 border-dashed border-zinc-200 p-12 dark:border-zinc-800">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Bem-vindo ao Dashboard Placeholder
            </h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Esta área será utilizada para gerenciar as funcionalidades da
              plataforma.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
