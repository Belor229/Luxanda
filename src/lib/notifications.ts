import { createClient } from '@supabase/supabase-js'

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
const twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_FROM
const twilioSMSFrom = process.env.TWILIO_SMS_FROM

/**
 * Service de notifications pour Luxanda
 * Gère les SMS (via Supabase/Twilio) et WhatsApp (via Twilio SDK)
 */
export const NotificationsService = {
  /**
   * Envoie une notification d'approbation KYC via WhatsApp
   */
  async sendApprovalNotif(phone: string, storeName: string) {
    if (!twilioAccountSid || !twilioAuthToken) {
      console.warn('Twilio credentials missing. Skipping WhatsApp notification.')
      return
    }

    try {
      // Simulation ou appel Twilio SDK si installé
      // Note: On utilise fetch pour éviter une dépendance Twilio lourde si possible, 
      // mais le client préfère Twilio SDK. Pour le MVP, on implémente la logique REST.
      const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
          body: new URLSearchParams({
            To: `whatsapp:${phone}`,
            From: `whatsapp:${twilioWhatsAppFrom}`,
            Body: `Félicitations ! Votre boutique "${storeName}" a été approuvée sur Luxanda. Accédez à votre tableau de bord ici : https://luxanda.vercel.app/vendor/dashboard`
          }),
        }
      )

      return await response.json()
    } catch (error) {
      console.error('WhatsApp Approval Notif Error:', error)
    }
  },

  /**
   * Envoie une notification de rejet KYC via WhatsApp
   */
  async sendRejectionNotif(phone: string, storeName: string, reason: string) {
    if (!twilioAccountSid || !twilioAuthToken) return
    
    try {
      const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
          body: new URLSearchParams({
            To: `whatsapp:${phone}`,
            From: `whatsapp:${twilioWhatsAppFrom}`,
            Body: `Votre boutique "${storeName}" a été refusée. Motif : ${reason}. Veuillez corriger vos informations et soumettre à nouveau.`
          }),
        }
      )
      return await response.json()
    } catch (error) {
      console.error('WhatsApp Rejection Notif Error:', error)
    }
  },

  /**
   * Envoie un rappel d'expiration d'abonnement
   */
  async sendExpirationReminder(phone: string, storeName: string, daysLeft: number) {
    if (!twilioAccountSid || !twilioAuthToken) return
    
    try {
      const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')
      const message = daysLeft > 0 
        ? `Rappel : Votre abonnement Luxanda pour "${storeName}" expire dans ${daysLeft} jour(s). Renouvelez-le pour garder vos produits en ligne.`
        : `Urgent : Votre abonnement Luxanda pour "${storeName}" a expiré. Vos produits sont désormais masqués. Renouvelez-le ici : https://luxanda.vercel.app/vendor-subscription`

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
          body: new URLSearchParams({
            To: `whatsapp:${phone}`,
            From: `whatsapp:${twilioWhatsAppFrom}`,
            Body: message
          }),
        }
      )
      return await response.json()
    } catch (error) {
      console.error('WhatsApp Expiration Notif Error:', error)
    }
  }
}
