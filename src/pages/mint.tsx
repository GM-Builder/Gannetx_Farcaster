import dynamic from 'next/dynamic';

const MintClient = dynamic(() => import('@/components/MintClient'), { ssr: false });

export default function MintPageWrapper() {
  return <MintClient />;
}