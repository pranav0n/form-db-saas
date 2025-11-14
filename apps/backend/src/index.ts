import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import whatsappRouter from './routes/whatsapp'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ 
    message: 'SaaS Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      whatsapp: '/whatsapp',
      latest: '/whatsapp/latest'
    }
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/whatsapp', whatsappRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

