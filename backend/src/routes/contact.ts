import express from 'express'
import { body, validationResult } from 'express-validator'
import { getDB } from '../config/database'
import nodemailer from 'nodemailer'

const router = express.Router()

// Contact form submission
router.post('/send', [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('subject').optional().trim().isLength({ max: 255 }),
  body('message').trim().isLength({ min: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const { name, email, subject, message } = req.body
    const db = getDB()

    // Save to database
    await db.execute(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject || 'Contact via site web', message]
    )

    // Send email notification
    try {
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'luxanda@yahoo.com',
          pass: process.env.SMTP_PASS || ''
        }
      })

      const mailOptions = {
        from: process.env.SMTP_USER || 'luxanda@yahoo.com',
        to: 'luxanda@yahoo.com',
        subject: `Nouveau message de contact - ${subject || 'Sans objet'}`,
        html: `
          <h2>Nouveau message de contact</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Sujet:</strong> ${subject || 'Sans objet'}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><em>Message envoyé depuis le site web Luxanda</em></p>
        `
      }

      await transporter.sendMail(mailOptions)
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't fail the request if email fails
    }

    res.json({
      message: 'Votre message a bien été envoyé. L\'équipe Luxanda vous contactera sous peu.'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    res.status(500).json({
      error: 'Erreur lors de l\'envoi du message'
    })
  }
})

// Get contact messages (Admin only)
router.get('/messages', async (req, res) => {
  try {
    const db = getDB()
    const [messages] = await db.execute(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    )

    res.json({
      messages: Array.isArray(messages) ? messages : []
    })

  } catch (error) {
    console.error('Get contact messages error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des messages'
    })
  }
})

export default router
