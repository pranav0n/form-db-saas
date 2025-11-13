import { useEffect, useMemo, useRef, useState } from 'react'
import {
  formatWhatsappValue,
  validateWhatsappValue,
  type WhatsappSyncStatus
} from '@saas/shared'

interface UseWhatsappFieldOptions {
  endpoint?: string
  defaultCountry?: string
}

interface WhatsappFieldApi {
  phone: string
  setPhone: (phone: string) => void
  country: string
  setCountry: (country: string) => void
  helperMessage: string
  status: WhatsappSyncStatus
  normalizedValue: string
  lastStoredAt?: string
}

const STORAGE_KEY = 'coss:whatsapp-number'

export function useWhatsappField(options?: UseWhatsappFieldOptions): WhatsappFieldApi {
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState(options?.defaultCountry || 'in')
  const [status, setStatus] = useState<WhatsappSyncStatus>('idle')
  const [helperMessage, setHelperMessage] = useState('Enter your WhatsApp number.')
  const [lastStoredAt, setLastStoredAt] = useState<string>()
  const lastSyncedValueRef = useRef<string>('')

  const endpoint = useMemo(() => {
    return options?.endpoint ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
  }, [options?.endpoint])

  const validation = useMemo(() => validateWhatsappValue(phone), [phone])
  const normalizedValue = useMemo(() => formatWhatsappValue(phone), [phone])

  useEffect(() => {
    if (!phone) {
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
  }, [phone, validation.isValid, validation.issue])

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

  return {
    phone,
    setPhone,
    country,
    setCountry,
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

