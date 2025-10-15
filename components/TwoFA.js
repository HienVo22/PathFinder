const nodemailer = require('nodemailer')
const crypto = require('crypto')

let user2FACodes = {}  // Temporary storage for 2FA codes (you can replace this with a DB)

const transporter = nodemailer.createTransport({
  service: 'gmail',  // Use your mail provider
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
})

// Step 1: Generate and send 2FA code to the user's email
app.post('/api/auth/send-2fa-code', async (req, res) => {
  const { email } = req.body

  // Generate a random 6-digit code
  const code = crypto.randomInt(100000, 999999)

  // Store the code temporarily (in production, store in a database with expiration time)
  user2FACodes[email] = code

  // Send the code to the user's email
  try {
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Your 2FA Code',
      text: `Your 2FA code is: ${code}`
    })
    res.status(200).send({ message: '2FA code sent to email' })
  } catch (error) {
    console.error('Email send error:', error)
    res.status(500).send({ error: 'Failed to send 2FA code' })
  }
})

// Step 2: Verify 2FA code
app.post('/api/auth/verify-2fa-code', (req, res) => {
  const { email, code } = req.body

  // Check if the provided code matches the stored code
  if (user2FACodes[email] === parseInt(code)) {
    // The code is correct; now generate a JWT token for the user
    const token = generateJWTToken(email)  // Replace with your JWT generation logic

    // Clean up the code (it should expire after use)
    delete user2FACodes[email]

    return res.status(200).json({ message: '2FA verified', token })
  } else {
    return res.status(400).send({ error: 'Invalid 2FA code' })
  }
})
