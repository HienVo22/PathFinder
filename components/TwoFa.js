import express from 'express'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const app = express()
app.use(express.json())

const user2FACodes = {}

// Replace with your actual Gmail credentials
const EMAIL_USER = 'pathfinderjobsearcher@gmail.com'
const EMAIL_PASS = 'PathF!nder5$'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
})

app.post('/api/auth/send-2fa-code', async (req, res) => {
  const { email } = req.body
  const code = crypto.randomInt(100000, 999999)
  user2FACodes[email] = { code, expiresAt: Date.now() + 5 * 60 * 1000 }

  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Your 2FA Code',
      text: `Your 2FA code is: ${code}`
    })
    res.status(200).json({ message: '2FA code sent to email' })
  } catch (err) {
    console.error('Email send error:', err)
    res.status(500).json({ error: 'Failed to send 2FA code' })
  }
})

app.post('/api/auth/verify-2fa-code', (req, res) => {
  const { email, code } = req.body
  const entry = user2FACodes[email]

  if (!entry || Date.now() > entry.expiresAt || entry.code !== parseInt(code)) {
    return res.status(400).json({ error: 'Invalid or expired code' })
  }

  delete user2FACodes[email]
  const token = jwt.sign({ email }, 'your_jwt_secret', { expiresIn: '1h' }) // Replace 'your_jwt_secret' with a secret string
  res.status(200).json({ message: '2FA verified', token })
})

app.listen(3000, () => console.log('Server running on port 3000'))