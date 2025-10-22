import { useState, useEffect } from 'react';
import { request, gql } from 'graphql-request';
import { REFERRAL_SUBGRAPH_ENDPOINT } from '@/utils/constants';

interface Referrer {
  firstReferralTimestamp: any;
  id: string;
  totalReferrals: number;
  totalRewards: string;
}

export const useTopReferrers = (limit: number = 10) => {
  const [data, setData] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopReferrers = async () => {
      try {
        setLoading(true);
        const query = gql`
          query GetTopReferrers($limit: Int!) {
            referrers(
              first: $limit
              orderBy: totalReferrals
              orderDirection: desc
            ) {
              id
              totalReferrals
              totalRewards
            }
          }
        `;

        const result: any = await request(REFERRAL_SUBGRAPH_ENDPOINT, query, { limit });
        setData(result.referrers || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching top referrers:', err);
        setError('Failed to fetch referrers');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopReferrers();
  }, [limit]);

  return { data, loading, error };
};