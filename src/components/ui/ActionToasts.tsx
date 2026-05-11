"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";

type ToastStatus = "loading" | "success" | "error";

interface ToastItem {
  id: string;
  status: ToastStatus;
  title: string;
  detail: string;
}

const actionablePrefixes = ["/api/bot", "/api/studio", "/api/auth/login", "/api/auth/logout"];

export function ActionToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = requestInfo(input, init);
      if (!request.shouldNotify) return originalFetch(input, init);

      const id = createToastId();
      setToasts((current) => [
        ...current,
        {
          id,
          status: "loading",
          title: request.label,
          detail: "Commande envoyée au serveur..."
        }
      ]);

      try {
        const response = await originalFetch(input, init);
        if (response.ok) {
          updateToast(id, "success", request.label, "Action terminée.");
        } else {
          const detail = await response
            .clone()
            .json()
            .then((data) => (typeof data?.error === "string" ? data.error : "Le serveur a refusé l'action."))
            .catch(() => "Le serveur a refusé l'action.");
          updateToast(id, "error", request.label, detail);
        }
        scheduleRemove(id);
        return response;
      } catch (error) {
        updateToast(id, "error", request.label, error instanceof Error ? error.message : "Action impossible.");
        scheduleRemove(id);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  function updateToast(id: string, status: ToastStatus, title: string, detail: string) {
    setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, status, title, detail } : toast)));
  }

  function scheduleRemove(id: string) {
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "pointer-events-auto flex items-start gap-3 rounded-lg border bg-[#151b24]/95 p-3 text-sm shadow-glass backdrop-blur",
            toast.status === "loading" && "border-lounge-line",
            toast.status === "success" && "border-emerald-300/35",
            toast.status === "error" && "border-rose-300/40"
          )}
        >
          <ToastIcon status={toast.status} />
          <div className="min-w-0">
            <p className="font-medium text-lounge-pearl">{toast.title}</p>
            <p className="mt-0.5 line-clamp-2 text-white/58">{toast.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ToastIcon({ status }: { status: ToastStatus }) {
  if (status === "loading") return <Loader2 className="mt-0.5 animate-spin text-lounge-champagne" size={18} />;
  if (status === "success") return <CheckCircle2 className="mt-0.5 text-emerald-200" size={18} />;
  return <CircleAlert className="mt-0.5 text-rose-200" size={18} />;
}

function requestInfo(input: RequestInfo | URL, init?: RequestInit): { shouldNotify: boolean; label: string } {
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  if (method === "GET" || method === "HEAD") return { shouldNotify: false, label: "" };

  const rawUrl = input instanceof Request ? input.url : String(input);
  const url = new URL(rawUrl, window.location.origin);
  const shouldNotify = actionablePrefixes.some((prefix) => url.pathname.startsWith(prefix));
  if (!shouldNotify) return { shouldNotify: false, label: "" };

  return { shouldNotify: true, label: labelFor(url.pathname) };
}

function labelFor(pathname: string): string {
  if (pathname.startsWith("/api/studio")) return "Studio";
  if (pathname.includes("/users/")) return "Action membre";
  if (pathname.includes("/lounge/") || pathname.includes("/lounges")) return "Commande lounge";
  if (pathname.includes("/send-message")) return "Message Discord";
  if (pathname.includes("/settings")) return "Réglages";
  if (pathname.includes("/commands")) return "Commande custom";
  if (pathname.includes("/auth/")) return "Session";
  return "Action serveur";
}

function createToastId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}
