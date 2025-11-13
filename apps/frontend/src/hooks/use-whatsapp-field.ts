import { useEffect, useRef, useState } from 'react'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'
import type { WhatsappSyncStatus } from '@saas/shared'

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

  const endpoint = options?.endpoint ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

  // Validate phone number using libphonenumber-js with selected country
  const isValid = phone ? isValidPhoneNumber(phone, country.toUpperCase() as any) : false
  const normalizedValue = phone && isValid ? parsePhoneNumber(phone, country.toUpperCase() as any)?.formatInternational() || phone : phone

  useEffect(() => {
    if (!phone) {
      setStatus('idle')
      setHelperMessage('Enter your WhatsApp number.')
      return
    }

    if (!isValid) {
      setStatus('invalid')
      setHelperMessage('Invalid phone number for selected country.')
      return
    }

    setStatus('valid')
    setHelperMessage('Looks good—syncing now.')
  }, [phone, isValid])

  useEffect(() => {
    if (!isValid || !phone) {
      return
    }

    // Get E.164 format for backend storage, validating against selected country
    const parsedPhone = parsePhoneNumber(phone, country.toUpperCase() as any)
    const e164Number = parsedPhone?.number || phone

    if (e164Number === lastSyncedValueRef.current) {
      return
    }

    setStatus('syncing')
    queueMicrotask(() => persistLocally(e164Number))

    const controller = new AbortController()

    const sync = async () => {
      try {
        await fetch(`${endpoint}/whatsapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: e164Number,
            source: 'coss-ui'
          }),
          signal: controller.signal
        })

        lastSyncedValueRef.current = e164Number
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
  }, [endpoint, phone, isValid, country])

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

