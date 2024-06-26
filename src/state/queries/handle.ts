import React from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'

import {STALE} from '#/state/queries'
import {getAgent} from '#/state/session'

const handleQueryKeyRoot = 'handle'
const fetchHandleQueryKey = (handleOrDid: string) => [
  handleQueryKeyRoot,
  handleOrDid,
]
const didQueryKeyRoot = 'did'
const fetchDidQueryKey = (handleOrDid: string) => [didQueryKeyRoot, handleOrDid]

export function useFetchHandle() {
  const queryClient = useQueryClient()

  return React.useCallback(
    async (handleOrDid: string) => {
      if (handleOrDid.startsWith('did:')) {
        const res = await queryClient.fetchQuery({
          staleTime: STALE.MINUTES.FIVE,
          queryKey: fetchHandleQueryKey(handleOrDid),
          queryFn: () => getAgent().getProfile({actor: handleOrDid}),
        })
        return res.data.handle
      }
      return handleOrDid
    },
    [queryClient],
  )
}

export function useUpdateHandleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({handle}: {handle: string}) => {
      await getAgent().updateHandle({handle})
    },
    onSuccess(_data, variables) {
      queryClient.invalidateQueries({
        queryKey: fetchHandleQueryKey(variables.handle),
      })
    },
  })
}

export function useFetchDid() {
  const queryClient = useQueryClient()

  return React.useCallback(
    async (handleOrDid: string) => {
      return queryClient.fetchQuery({
        staleTime: STALE.INFINITY,
        queryKey: fetchDidQueryKey(handleOrDid),
        queryFn: async () => {
          let identifier = handleOrDid
          if (!identifier.startsWith('did:')) {
            const res = await getAgent().resolveHandle({handle: identifier})
            identifier = res.data.did
          }
          return identifier
        },
      })
    },
    [queryClient],
  )
}
