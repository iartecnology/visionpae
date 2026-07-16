'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { api } from './api';

export function useApiGet<T>(path: string | null) {
  return useSWR<T>(path, (url: string) => api.get<T>(url), {
    revalidateOnFocus: true,
    dedupingInterval: 10000,
    errorRetryCount: 2,
  });
}

export function useApiPost<T>(path: string) {
  return useSWRMutation<T, any, string, any>(path, (url, { arg }) =>
    api.post<T>(url, arg),
  );
}

export function useApiPut<T>(path: string) {
  return useSWRMutation<T, any, string, any>(path, (url, { arg }) =>
    api.put<T>(url, arg),
  );
}
