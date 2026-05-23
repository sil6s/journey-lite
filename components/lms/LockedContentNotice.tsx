import Link from "next/link";
import { Lock, Phone, Calendar } from "lucide-react";
interface LockedContentNoticeProps {
  courseTitle: string;
  courseSlug: string;
  reason?: "not-enrolled" | "expired" | "revoked" | "unauthenticated";
}

export function LockedContentNotice({
  courseTitle,
  courseSlug,
  reason = "not-enrolled",
}: LockedContentNoticeProps) {
  const messages: Record<typeof reason, { title: string; body: string }> = {
    "not-enrolled": {
      title: "This course isn't on your account yet.",
      body: "To access this content, please contact the JourneyLite team. They can add you to the course based on your care plan.",
    },
    expired: {
      title: "Your access to this course has expired.",
      body: "Please reach out to your care team to renew access.",
    },
    revoked: {
      title: "Access to this course is not available.",
      body: "If you believe this is a mistake, please contact the practice.",
    },
    unauthenticated: {
      title: "Sign in to access this lesson.",
      body: "This lesson is only available to enrolled patients. Create an account or sign in to continue.",
    },
  };

  const { title, body } = messages[reason];

  return (
    <div className="flex flex-col items-center rounded-2xl border border-[#dce4df] bg-white px-6 py-16 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f1f5f9]">
        <Lock className="h-8 w-8 text-[#64748b]" />
      </div>

      <h2 className="mt-6 text-xl font-semibold text-[#1f2c25]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#66756d]">{body}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {reason === "unauthenticated" ? (
          <>
            <Link
              href={`/login?redirectTo=/courses/${courseSlug}`}
              className="inline-flex items-center gap-2 rounded-md bg-[#145c42] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            >
              Sign in to continue
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md border border-[#cbd7d0] bg-white px-5 py-2.5 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            <a
              href="tel:+18774422263"
              className="inline-flex items-center gap-2 rounded-md bg-[#145c42] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37]"
            >
              <Phone className="h-4 w-4" />
              Call 877-442-2263
            </a>
            <Link
              href={`/courses/${courseSlug}`}
              className="inline-flex items-center gap-2 rounded-md border border-[#cbd7d0] bg-white px-5 py-2.5 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42]"
            >
              Back to {courseTitle}
            </Link>
          </>
        )}
      </div>

      <p className="mt-6 text-xs text-[#8fa09a]">
        Questions? Contact us at{" "}
        <a className="underline hover:text-[#66756d]" href="mailto:info@journeylite.com">
          info@journeylite.com
        </a>
      </p>
    </div>
  );
}
