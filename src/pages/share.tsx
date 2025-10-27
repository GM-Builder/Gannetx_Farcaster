import { GetServerSideProps } from 'next';
import React from 'react';
import ReferralShare from '@/components/ReferralShare';

type SharePageProps = {
  castHash?: string | null;
  castFid?: string | null;
  viewerFid?: string | null;
};

const SharePage: React.FC<SharePageProps> = ({ castHash, castFid, viewerFid }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-cyan-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-xl w-full p-6 rounded-2xl bg-white/90 dark:bg-slate-900/80 shadow-xl border border-gray-200/50 dark:border-slate-700/50">
        <h1 className="text-lg font-semibold mb-2">Shared to Gannetx</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">This Mini App received a shared cast. You can view context below or share your referral link back to Farcaster.</p>

        <div className="space-y-3">
          <div className="text-sm">
            <strong>Cast Hash:</strong>
            <div className="mt-1 break-all text-xs text-gray-700 dark:text-gray-200">{castHash || '—'}</div>
          </div>

          <div className="text-sm">
            <strong>Cast Author FID:</strong>
            <div className="mt-1 text-xs text-gray-700 dark:text-gray-200">{castFid || '—'}</div>
          </div>

          <div className="text-sm">
            <strong>Viewer FID:</strong>
            <div className="mt-1 text-xs text-gray-700 dark:text-gray-200">{viewerFid || '—'}</div>
          </div>
        </div>

        <div className="mt-6">
          <ReferralShare castHash={castHash} castFid={castFid} viewerFid={viewerFid} />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { castHash = null, castFid = null, viewerFid = null } = context.query || {};
  // Ensure values are strings or null
  return {
    props: {
      castHash: Array.isArray(castHash) ? castHash[0] : castHash,
      castFid: Array.isArray(castFid) ? castFid[0] : castFid,
      viewerFid: Array.isArray(viewerFid) ? viewerFid[0] : viewerFid,
    }
  };
};

export default SharePage;
