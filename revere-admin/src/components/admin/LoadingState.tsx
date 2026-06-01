export function LoadingState() {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-50" />
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Carregando...
      </p>
    </div>
  );
}
