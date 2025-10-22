// src/utils/apolloClient.ts

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { SUBGRAPH_ENDPOINTS, ChainName } from './subgraph';
import { REFERRAL_SUBGRAPH_ENDPOINT } from './constants';
import fetch from 'cross-fetch';

// Create Apollo Client for specific chain
export const createSubgraphClient = (chain: ChainName) => {
  return new ApolloClient({
    link: new HttpLink({
      uri: SUBGRAPH_ENDPOINTS[chain],
      fetch,
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            globalStats: {
              merge: true,
            },
            navigator: {
              merge: true,
            },
          },
        },
      },
    }),
    defaultOptions: {
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
    },
  });
};

// Create clients for all chains
export const subgraphClients = {
  base: createSubgraphClient('base'),
  ink: createSubgraphClient('ink'),
  soneium: createSubgraphClient('soneium'),
};

export const referralClient = new ApolloClient({
  link: new HttpLink({
    uri: REFERRAL_SUBGRAPH_ENDPOINT,
    fetch,
  }),
  cache: new InMemoryCache({ 
    typePolicies: {
      Query: {
        fields: {
          referrer: {
            merge: true,
          },
          user: {
            merge: true,
          },
          referralStats: {
            merge: true,
          },
        },
      },
    }, 
  }),

  defaultOptions: { 
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
});