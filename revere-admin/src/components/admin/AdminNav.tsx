import Link from "next/link";
import { adminNavigation } from "@/lib/navigation";

export function AdminNav() {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {adminNavigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
