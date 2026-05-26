"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { resetMyProgress } from "@/lib/lms/actions";

const CONFIRM_WORD = "RESTART";

interface ResetProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "warn" | "confirm" | "done" | "error";

export function ResetProgressDialog({ open, onOpenChange }: ResetProgressDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("warn");
  const [checked, setChecked] = useState(false);
  const [typed, setTyped] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) {
      // Reset internal state when dialog closes
      setStep("warn");
      setChecked(false);
      setTyped("");
      setErrorMsg("");
    }
    onOpenChange(next);
  }

  function handleReset() {
    startTransition(async () => {
      const result = await resetMyProgress();
      if (result.error) {
        setErrorMsg(result.error);
        setStep("error");
        return;
      }
      setStep("done");
      // Give the "done" state a moment, then redirect
      setTimeout(() => {
        onOpenChange(false);
        router.push("/courses");
        router.refresh();
      }, 1800);
    });
  }

  const canSubmit = checked && typed === CONFIRM_WORD && !isPending;

  // ── Step: warn ────────────────────────────────────────────────────────────
  if (step === "warn") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center text-lg">Restart Course Progress?</DialogTitle>
            <DialogDescription className="text-center text-sm text-[#53635b]">
              This will permanently delete all of your lesson progress, quiz answers, and
              activity completions across every course. Your course assignments will be
              reset so you start from lesson&nbsp;1.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 space-y-1">
            <p className="font-semibold">What gets deleted:</p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-700">
              <li>Lesson completion records</li>
              <li>Quiz attempts and answers</li>
              <li>Activity completions</li>
              <li>Course completion attestations</li>
            </ul>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)} className="flex-1">
              Never mind
            </Button>
            <Button
              className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
              onClick={() => setStep("confirm")}
            >
              I understand — continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Step: confirm ─────────────────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center text-lg">Final confirmation</DialogTitle>
            <DialogDescription className="text-center text-sm text-[#53635b]">
              This cannot be undone. Please confirm below to permanently wipe your progress.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="confirm-check"
                checked={checked}
                onCheckedChange={(val) => setChecked(Boolean(val))}
                className="mt-0.5"
              />
              <Label htmlFor="confirm-check" className="text-sm leading-snug text-[#1f2c25] cursor-pointer">
                I understand that all my lesson progress, quiz answers, and activity completions
                will be <span className="font-semibold">permanently deleted</span> and cannot be recovered.
              </Label>
            </div>

            {/* Type to confirm */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm-type" className="text-sm text-[#53635b]">
                Type <span className="font-mono font-bold text-[#1f2c25]">{CONFIRM_WORD}</span> to confirm
              </Label>
              <Input
                id="confirm-type"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={CONFIRM_WORD}
                className={`font-mono ${typed === CONFIRM_WORD ? "border-green-500 ring-1 ring-green-400" : ""}`}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setStep("warn")} className="flex-1" disabled={isPending}>
              Go back
            </Button>
            <Button
              className="flex-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
              onClick={handleReset}
              disabled={!canSubmit}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting…
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset all progress
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Step: done ────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <RotateCcw className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Progress reset!</DialogTitle>
            <DialogDescription className="text-center text-sm text-[#53635b]">
              All your progress has been cleared. Redirecting you to the courses page…
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Step: error ───────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-red-700">Something went wrong</DialogTitle>
          <DialogDescription className="text-center text-sm text-[#53635b]">
            {errorMsg || "We couldn't reset your progress. Please try again or contact support."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" className="w-full" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
