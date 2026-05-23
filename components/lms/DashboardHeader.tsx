interface DashboardHeaderProps {
  firstName?: string | null;
  coursesInProgress: number;
}

export function DashboardHeader({ firstName, coursesInProgress }: DashboardHeaderProps) {
  const greeting = firstName ? `Welcome back, ${firstName}.` : "Welcome back.";

  return (
    <div className="border-b border-[#dce4df] pb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#145c42]">
        Patient Education Center
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-[#1f2c25] sm:text-4xl">{greeting}</h1>
      <p className="mt-2 text-base text-[#66756d]">
        {coursesInProgress > 0
          ? `You have ${coursesInProgress} course${coursesInProgress > 1 ? "s" : ""} in progress.`
          : "Find a course to start your bariatric learning journey."}
      </p>
    </div>
  );
}
