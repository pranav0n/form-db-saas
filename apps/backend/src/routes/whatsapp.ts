import { Router, type Request, type Response } from 'express'
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'
import type { WhatsappSubmission } from '@saas/shared'

const whatsappRouter: Router = Router()
const recentSubmissions: WhatsappSubmission[] = []
const MAX_SUBMISSIONS = 100

whatsappRouter.post('/', (req: Request, res: Response) => {
  const candidate = typeof req.body?.number === 'string' ? req.body.number : ''

  if (!candidate || !isValidPhoneNumber(candidate)) {
    return res.status(400).json({
      status: 'invalid',
      issue: 'Invalid phone number.'
    })
  }

  // Parse and normalize to E.164 format
  const parsedPhone = parsePhoneNumber(candidate)
  const e164Number = parsedPhone?.number || candidate

  const submission: WhatsappSubmission = {
    number: e164Number,
    capturedAt: new Date().toISOString(),
    source: typeof req.body?.source === 'string' ? req.body.source : 'web'
  }

  recentSubmissions.push(submission)
  if (recentSubmissions.length > MAX_SUBMISSIONS) {
    recentSubmissions.shift()
  }

  return res.status(202).json({
    status: 'accepted',
    submission
  })
})

whatsappRouter.get('/latest', (_req: Request, res: Response) => {
  const latest = recentSubmissions[recentSubmissions.length - 1]

  if (!latest) {
    return res.status(404).json({
      status: 'empty',
      message: 'No WhatsApp submissions stored yet.'
    })
  }

  return res.json({
    status: 'ok',
    submission: latest
  })
})

export default whatsappRouter

