import { Suspense } from "react";
import { AuthCallbackInner } from "./AuthCallbackInner";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen flex items-center justify-center px-6">
          <p className="text-sm text-ink-600">Loading…</p>
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
