import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

type RefPageProps = {
  embedContent: string;
  fullUrl: string;
};

const RefRedirectPage: React.FC<RefPageProps> = ({ embedContent, fullUrl }) => {
  const router = useRouter();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    // Try to open Farcaster via a custom scheme (best-effort). We still render UI for manual fallback.
    try {
      // Use a simple heuristic: attempt to open a custom scheme with the target URL encoded.
      window.location.href = `farcaster://open?url=${encodeURIComponent(fullUrl)}`;
    } catch (e) {
      // ignore
    }

    setTimeout(() => setTried(true), 700);
  }, [fullUrl]);

  return (
    <>
      <Head>
        {/* Embed metadata for Farcaster scrapers */}
        <meta name="fc:miniapp" content={embedContent} />
        <meta name="fc:frame" content={embedContent} />
        <meta name="og:title" content="Join me on Gannetx" />
        <meta name="og:description" content="Open the Gannetx Mini App on Farcaster to join and claim rewards." />
        <meta name="og:image" content="/frame-preview.png" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-white/50 dark:bg-slate-900">
        <div className="max-w-xl w-full p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-gray-200 dark:border-slate-700">
          <h1 className="text-lg font-semibold mb-2">Open in Farcaster</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">We're trying to open this referral inside the Farcaster app. If nothing happens, use the button below to open it manually.</p>
          <div className="flex gap-2">
            <a
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold"
              href={`farcaster://open?url=${encodeURIComponent(fullUrl)}`}
              onClick={() => { /* best-effort */ }}
            >
              Open in Farcaster
            </a>
            <button
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800"
              onClick={() => navigator.clipboard.writeText(fullUrl)}
            >
              Copy link
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>If the Farcaster client does not support deep links on your device, open Farcaster and paste the link into a new cast or open it in the in-app browser.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<RefPageProps> = async (context) => {
  const { ref = '' } = context.query || {};
  const refId = Array.isArray(ref) ? ref[0] : ref || '';

  // Determine base URL: prefer NEXT_PUBLIC_APP_URL, otherwise build from headers
  const envBase = process.env.NEXT_PUBLIC_APP_URL;
  let base = envBase;
  if (!base) {
    const proto = context.req.headers['x-forwarded-proto'] || 'https';
    const host = context.req.headers.host || 'localhost';
    base = `${proto}://${host}`;
  }

  const fullUrl = `${base.replace(/\/$/, '')}/?ref=${encodeURIComponent(refId)}`;

  const embed = {
    version: '1',
    imageUrl: `${base.replace(/\/$/, '')}/frame-preview.png`,
    button: {
      title: 'Open Gannetx',
      action: {
        type: 'launch_miniapp',
        url: fullUrl,
        name: 'Gannetx',
        splashImageUrl: `${base.replace(/\/$/, '')}/logo.png`,
        splashBackgroundColor: '#0ea5a4'
      }
    }
  };

  return {
    props: {
      embedContent: JSON.stringify(embed),
      fullUrl,
    }
  };
};

export default RefRedirectPage;
