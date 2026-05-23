import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd9d1] bg-white px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#edf4ef] text-[#145c42]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#1f2c25]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#66756d]">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-flex items-center rounded-md bg-[#145c42] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
