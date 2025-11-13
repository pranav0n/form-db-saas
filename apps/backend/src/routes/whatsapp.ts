import { Router, type Request, type Response } from 'express'
import type { WhatsappSubmission } from '@saas/shared'
import { validateWhatsappValue } from '@saas/shared'

const whatsappRouter: Router = Router()
const recentSubmissions: WhatsappSubmission[] = []
const MAX_SUBMISSIONS = 100

whatsappRouter.post('/', (req: Request, res: Response) => {
  const candidate = typeof req.body?.number === 'string' ? req.body.number : ''
  const validation = validateWhatsappValue(candidate)

  if (!validation.isValid || !validation.formattedValue) {
    return res.status(400).json({
      status: 'invalid',
      issue: validation.issue ?? 'Invalid WhatsApp number.'
    })
  }

  const submission: WhatsappSubmission = {
    number: validation.formattedValue,
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

