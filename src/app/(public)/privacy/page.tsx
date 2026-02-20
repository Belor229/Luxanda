import { Container } from '@/components/ui/Container'

export default function PrivacyPage() {
  return (
    <Container className="py-12">
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
        <p className="text-gray-600 mb-4">Dernière mise à jour : {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Collecte des données</h2>
          <p>
            Nous collectons les informations que vous nous fournissez directement (nom, email, adresse, téléphone) lorsque vous créez un compte,
            passez une commande ou nous contactez.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Utilisation des données</h2>
          <p>
            Nous utilisons vos données pour :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Traiter vos commandes et livraisons.</li>
            <li>Gérer votre compte utilisateur.</li>
            <li>Vous envoyer des informations sur vos commandes.</li>
            <li>Améliorer nos services et personnaliser votre expérience.</li>
            <li>Vous envoyer des offres promotionnelles (avec votre consentement).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Partage des données</h2>
          <p>
            Nous ne vendons pas vos données personnelles. Elles peuvent être partagées avec des prestataires tiers (transporteurs, solutions de paiement)
            uniquement dans le cadre de l'exécution des services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé, la modification ou la destruction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Vos droits</h2>
          <p>
            Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.
            Vous pouvez exercer ces droits en nous contactant.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
          <p>
            Notre site utilise des cookies pour améliorer votre navigation et mesurer l'audience. Vous pouvez configurer votre navigateur pour refuser les cookies.
          </p>
        </section>
      </div>
    </Container>
  )
}
