import React, { useCallback, useState } from 'react';
import sdk from '@farcaster/miniapp-sdk';

type ReferralShareProps = {
  castHash?: string | null;
  castFid?: string | null;
  viewerFid?: string | null;
};

const ReferralShare: React.FC<ReferralShareProps> = ({ castHash, castFid, viewerFid }) => {
  const [copied, setCopied] = useState(false);
  const referralCode = viewerFid || 'guest';
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '');
  const referralUrl = `${baseUrl}/ref?ref=${referralCode}`;

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('copy failed', e);
    }
  }, [referralUrl]);

  const onShare = useCallback(async () => {
    // Prefer the Web Share API
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join me on Gannetx',
          text: `Join me on Gannetx: ${referralUrl}`,
          url: referralUrl,
        });
        return;
      }

      // If running inside Farcaster and SDK available, try to open a share flow
      if ((sdk as any)?.actions?.share) {
        try {
          await (sdk as any).actions.share({
            type: 'url',
            url: referralUrl,
            title: 'Join me on Gannetx',
            text: `Join me on Gannetx: ${referralUrl}`
          });
          return;
        } catch (e) {
          console.warn('SDK share failed', e);
        }
      }

      // Fallback: copy URL and show message
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Share failed', err);
    }
  }, [referralUrl]);

  return (
    <div>
      <div className="rounded-md p-3 border border-gray-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70">
        <p className="text-sm text-gray-700 dark:text-gray-200">Your referral link — share it on Farcaster or copy it to clipboard.</p>
        <div className="flex items-center mt-3 gap-2">
          <input readOnly value={referralUrl} className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 px-3 py-2 border border-gray-200 rounded-lg" />
          <button onClick={onCopy} className="px-3 py-2 bg-cyan-500 text-white rounded-lg text-sm">{copied ? 'Copied' : 'Copy'}</button>
          <button onClick={onShare} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Share</button>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Shared cast context:</p>
        <div className="mt-1">
          <div><strong>castHash:</strong> {castHash || '—'}</div>
          <div><strong>castFid:</strong> {castFid || '—'}</div>
          <div><strong>viewerFid:</strong> {viewerFid || '—'}</div>
        </div>
      </div>
    </div>
  );
};

export default ReferralShare;
