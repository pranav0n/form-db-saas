import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  formatWhatsappValue,
  validateWhatsappValue,
  type WhatsappSyncStatus
} from '@saas/shared'

interface UseWhatsappFieldOptions {
  endpoint?: string
}

interface WhatsappFieldApi {
  fieldProps: {
    value: string
    onChange: (event: ChangeEvent<HTMLInputElement>) => void
    name: string
    inputMode: 'tel'
    autoComplete: 'tel'
    placeholder: string
  }
  helperMessage: string
  status: WhatsappSyncStatus
  normalizedValue: string
  lastStoredAt?: string
}

const STORAGE_KEY = 'coss:whatsapp-number'

export function useWhatsappField(options?: UseWhatsappFieldOptions): WhatsappFieldApi {
  const [rawValue, setRawValue] = useState('')
  const [status, setStatus] = useState<WhatsappSyncStatus>('idle')
  const [helperMessage, setHelperMessage] = useState('Enter your WhatsApp number.')
  const [lastStoredAt, setLastStoredAt] = useState<string>()
  const lastSyncedValueRef = useRef<string>('')

  const endpoint = useMemo(() => {
    return options?.endpoint ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
  }, [options?.endpoint])

  const validation = useMemo(() => validateWhatsappValue(rawValue), [rawValue])
  const normalizedValue = useMemo(() => formatWhatsappValue(rawValue), [rawValue])

  useEffect(() => {
    if (!rawValue) {
      setStatus('idle')
      setHelperMessage('Enter your WhatsApp number.')
      return
    }

    if (!validation.isValid) {
      setStatus('invalid')
      setHelperMessage(validation.issue ?? 'Invalid WhatsApp number.')
      return
    }

    setStatus('valid')
    setHelperMessage('Looks good—syncing now.')
  }, [rawValue, validation.isValid, validation.issue])

  useEffect(() => {
    if (!validation.isValid || !validation.formattedValue) {
      return
    }

    if (validation.formattedValue === lastSyncedValueRef.current) {
      return
    }

    setStatus('syncing')
    queueMicrotask(() => persistLocally(validation.formattedValue))

    const controller = new AbortController()

    const sync = async () => {
      try {
        await fetch(`${endpoint}/whatsapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: validation.formattedValue,
            source: 'coss-ui'
          }),
          signal: controller.signal
        })

        lastSyncedValueRef.current = validation.formattedValue
        const timestamp = new Date().toISOString()
        setLastStoredAt(timestamp)
        setStatus('synced')
        setHelperMessage('Stored securely. You are all set.')
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        setStatus('error')
        setHelperMessage('Saved locally. Reconnect to sync.')
        lastSyncedValueRef.current = ''
      }
    }

    sync()

    return () => controller.abort()
  }, [endpoint, validation.formattedValue, validation.isValid])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRawValue(event.target.value)
  }

  return {
    fieldProps: {
      value: rawValue,
      onChange: handleChange,
      name: 'whatsapp',
      inputMode: 'tel',
      autoComplete: 'tel',
      placeholder: '+1 415 555 2671'
    },
    helperMessage,
    status,
    normalizedValue,
    lastStoredAt
  }
}

function persistLocally(value: string) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // no-op: storage might be unavailable (private mode)
  }
}

