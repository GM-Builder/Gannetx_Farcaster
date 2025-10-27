import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const RefRedirectPage: React.FC = () => {
  const router = useRouter();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const { ref } = router.query;
    const target = `${window.location.origin}/?ref=${Array.isArray(ref) ? ref[0] : ref || ''}`;

    // Best-effort: attempt to open Farcaster via custom scheme
    // Note: Farcaster's exact URL scheme may vary by client and platform.
    // We'll try several approaches and fall back to showing instructions.
    const tryOpen = () => {
      setTried(true);

      // 1) Custom scheme attempt
      try {
        window.location.href = `farcaster://open?url=${encodeURIComponent(target)}`;
      } catch (e) {
        // ignore
      }

      // 2) After short delay, show UI so user can open manually
      setTimeout(() => setTried(true), 800);
    };

    tryOpen();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white/50 dark:bg-slate-900">
      <div className="max-w-xl w-full p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-gray-200 dark:border-slate-700">
        <h1 className="text-lg font-semibold mb-2">Open in Farcaster</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">We're trying to open this referral inside the Farcaster app. If nothing happens, use the button below to open it manually.</p>
        <div className="flex gap-2">
          <a
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold"
            href={`farcaster://open?url=${encodeURIComponent(window.location.href)}`}
            onClick={() => { /* best-effort */ }}
          >
            Open in Farcaster
          </a>
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            Copy link
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>If the Farcaster client does not support deep links on your device, open Farcaster and paste the link into a new cast or open it in the in-app browser.</p>
        </div>
      </div>
    </div>
  );
};

export default RefRedirectPage;
