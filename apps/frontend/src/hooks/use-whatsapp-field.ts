import { useEffect, useMemo, useRef, useState } from 'react'
import { parsePhoneNumber, isValidPhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js'
import type { WhatsappSyncStatus } from '@saas/shared'

interface UseWhatsappFieldOptions {
  endpoint?: string
}

interface WhatsappFieldApi {
  phone: string
  setPhone: (phone: string) => void
  helperMessage: string
  status: WhatsappSyncStatus
  normalizedValue: string
  lastStoredAt?: string
}

const STORAGE_KEY = 'coss:whatsapp-number'
const DEFAULT_COUNTRY_CODE = '+91' // India

export function useWhatsappField(options?: UseWhatsappFieldOptions): WhatsappFieldApi {
  const [rawPhone, setRawPhone] = useState(DEFAULT_COUNTRY_CODE)
  const [status, setStatus] = useState<WhatsappSyncStatus>('idle')
  const [helperMessage, setHelperMessage] = useState('Enter your WhatsApp number.')
  const [lastStoredAt, setLastStoredAt] = useState<string>()
  const lastSyncedValueRef = useRef<string>('')

  const endpoint = options?.endpoint ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

  // Smart phone number formatting
  const phone = useMemo(() => {
    let value = rawPhone.trim()
    
    // Remove + if it's the only character
    if (value === '+') return ''
    
    // Ensure it starts with +
    if (value && !value.startsWith('+')) {
      value = '+' + value
    }
    
    return value
  }, [rawPhone])

  // Detect country from phone number
  const detectedCountry = useMemo(() => {
    if (!phone || phone === '+') return 'IN'
    
    try {
      // Try to parse to detect country
      const parsed = parsePhoneNumber(phone)
      return parsed?.country || 'IN'
    } catch {
      // If parsing fails, try to match country code
      for (const country of getCountries()) {
        try {
          const countryCode = getCountryCallingCode(country)
          if (phone.startsWith(`+${countryCode}`)) {
            return country
          }
        } catch {
          continue
        }
      }
      return 'IN'
    }
  }, [phone])

  // Validate phone number
  const isValid = useMemo(() => {
    if (!phone || phone === '+' || phone.length < 4) return false
    
    try {
      return isValidPhoneNumber(phone)
    } catch {
      return false
    }
  }, [phone])

  const normalizedValue = useMemo(() => {
    if (!phone || !isValid) return phone
    
    try {
      const parsed = parsePhoneNumber(phone)
      return parsed?.formatInternational() || phone
    } catch {
      return phone
    }
  }, [phone, isValid])

  useEffect(() => {
    if (!phone || phone === '+91' || phone === '+') {
      setStatus('idle')
      setHelperMessage('Enter your WhatsApp number.')
      return
    }

    if (!isValid) {
      setStatus('invalid')
      setHelperMessage(`Invalid phone number for ${detectedCountry}.`)
      return
    }

    setStatus('valid')
    setHelperMessage('Looks good—syncing now.')
  }, [phone, isValid, detectedCountry])

  useEffect(() => {
    if (!isValid || !phone) {
      return
    }

    // Get E.164 format for backend storage
    const parsedPhone = parsePhoneNumber(phone)
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
  }, [endpoint, phone, isValid])

  // Handle setting phone with automatic + prefix
  const handleSetPhone = (value: string) => {
    // User clearing the field
    if (!value) {
      setRawPhone(DEFAULT_COUNTRY_CODE)
      return
    }

    // User typed +
    if (value === '+') {
      setRawPhone('+')
      return
    }

    // Auto-add + if user starts typing digits
    if (value && !value.startsWith('+')) {
      setRawPhone('+' + value)
      return
    }

    setRawPhone(value)
  }

  return {
    phone: rawPhone,
    setPhone: handleSetPhone,
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

