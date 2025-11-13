import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { useWhatsappField } from '../hooks/use-whatsapp-field'

const statusCopy = {
  idle: { label: 'Awaiting input', accent: 'text-slate-500', pulse: false },
  invalid: { label: 'Fix number', accent: 'text-amber-500', pulse: false },
  valid: { label: 'Validating', accent: 'text-sky-500', pulse: true },
  syncing: { label: 'Saving…', accent: 'text-sky-500', pulse: true },
  synced: { label: 'Saved', accent: 'text-emerald-500', pulse: false },
  error: { label: 'Offline', accent: 'text-rose-500', pulse: false }
} as const

export function WhatsappCaptureCard() {
  const { phone, setPhone, country, setCountry, helperMessage, status, normalizedValue, lastStoredAt } = useWhatsappField({ defaultCountry: 'in' })
  const copy = statusCopy[status]

  return (
    <div className="min-h-screen bg-coss-night px-4 py-16 text-coss-cloud">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 lg:flex-row">
        <aside className="flex-1 rounded-4xl border border-white/10 bg-white/5 p-8 shadow-coss-card backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35rem] text-white/70">coss.com</p>
          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">Drop your WhatsApp number.</h1>
          <p className="mt-6 text-lg text-white/80">
            No submit buttons, no waiting. As soon as you type, we sanitize, validate, and store the number with
            sub-millisecond latency directly on your device before syncing to the edge.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <MetricTile label="Normalized" value={normalizedValue || '—'} />
            <MetricTile
              label="Last stored"
              value={lastStoredAt ? new Date(lastStoredAt).toLocaleTimeString() : '—'}
            />
          </div>
        </aside>

        <section className="flex-1 rounded-4xl border border-white/15 bg-white p-10 text-coss-ink shadow-coss-card">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Whatsapp capture</p>
              <h2 className="text-3xl font-semibold text-coss-ink">Always-on intake</h2>
            </div>
            <StatusBadge label={copy.label} accentClass={copy.accent} pulse={copy.pulse} />
          </header>

          <div className="mt-10 space-y-3">
            <label htmlFor="whatsapp" className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              WhatsApp number
            </label>
            <PhoneInput
              country={country}
              value={phone}
              onChange={(phone, meta) => {
                setPhone(phone)
                // Only update country if user explicitly changed it via dropdown
                if (meta.country && meta.country.iso2 !== country) {
                  setCountry(meta.country.iso2)
                }
              }}
              disableCountryGuess={true}
              forceDialCode={true}
              inputClassName="coss-input"
              countrySelectorStyleProps={{
                buttonClassName: "country-selector-button"
              }}
              aria-invalid={status === 'invalid'}
              aria-describedby="whatsapp-helper"
            />
            <p id="whatsapp-helper" className="text-sm text-slate-500">
              {helperMessage}
            </p>
          </div>

          <ul className="mt-12 space-y-4 text-sm text-slate-500">
            <li>• Instant client-side validation keeps latency under 1ms.</li>
            <li>• Numbers persist locally and sync to the API in the background.</li>
            <li>• Works even if the user navigates away—no submit required.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

interface MetricTileProps {
  label: string
  value: string
}

function MetricTile({ label, value }: MetricTileProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3rem] text-white/60">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

interface StatusBadgeProps {
  label: string
  accentClass: string
  pulse?: boolean
}

function StatusBadge({ label, accentClass, pulse }: StatusBadgeProps) {
  return (
    <span className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${accentClass}`}>
      <span
        className={`h-2.5 w-2.5 rounded-full bg-current ${pulse ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

