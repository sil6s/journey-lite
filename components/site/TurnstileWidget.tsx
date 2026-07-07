"use client";

import { useEffect, useRef } from "react";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileWidgetProps = {
  action: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
};

export function TurnstileWidget({ action, onVerify, onExpire, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onError, onExpire, onVerify]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !containerRef.current) return;

    let cancelled = false;
    let attempts = 0;
    const container = containerRef.current;
    const siteKey = TURNSTILE_SITE_KEY;

    function renderWidget() {
      if (cancelled || widgetIdRef.current || !container) return;

      if (!window.turnstile) {
        attempts += 1;
        if (attempts <= 40) window.setTimeout(renderWidget, 250);
        return;
      }

      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: siteKey,
        action,
        theme: "auto",
        callback: (token: string) => onVerifyRef.current(token),
        "expired-callback": () => {
          onVerifyRef.current("");
          onExpireRef.current?.();
        },
        "error-callback": () => {
          onVerifyRef.current("");
          onErrorRef.current?.();
        },
      });
    }

    renderWidget();

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [action]);

  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <div className="rounded-lg border border-[#dce7e0] bg-[#f8fbf9] p-3">
      <div ref={containerRef} />
    </div>
  );
}
