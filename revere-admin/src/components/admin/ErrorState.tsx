interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Ocorreu um erro",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-12 text-center dark:border-red-900/50 dark:bg-red-900/20">
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
        {title}
      </h3>
      <p className="mt-2 text-sm text-red-600 dark:text-red-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
