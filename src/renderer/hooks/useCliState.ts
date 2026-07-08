import { useState, useEffect, useCallback } from 'react'
import type { CliDefinition, CliState } from '@shared/types'

export function useCliState(cliId: string) {
  const [state, setState] = useState<CliState | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await window.electronAPI.getCliState(cliId)
      setState(result)
    } finally {
      setLoading(false)
    }
  }, [cliId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { state, loading, refresh }
}

export function useAllClis() {
  const [clis, setClis] = useState<CliDefinition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.electronAPI.getClis().then((result) => {
      setClis(result)
      setLoading(false)
    })
  }, [])

  return { clis, loading }
}
