import { Container } from '@/components/ui/Container'

export default function TermsPage() {
  return (
    <Container className="py-12">
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6">Conditions Générales d'Utilisation (CGU)</h1>
        <p className="text-gray-600 mb-4">Dernière mise à jour : {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p>
            Bienvenue sur Luxanda. En utilisant notre site web et nos services, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation.
            Veuillez les lire attentivement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Utilisation du service</h2>
          <p>
            Luxanda est une plateforme de marché en ligne permettant aux vendeurs de proposer des produits et aux acheteurs de les commander.
            Vous vous engagez à utiliser le site conformément aux lois en vigueur et à ne pas perturber son fonctionnement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Comptes utilisateurs</h2>
          <p>
            Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable de la confidentialité de vos identifiants
            et de toutes les activités effectuées sous votre compte.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Vendeurs et Produits</h2>
          <p>
            Les vendeurs sont responsables des produits qu'ils mettent en vente. Luxanda agit en tant qu'intermédiaire et ne garantit pas
            la qualité ou la conformité des produits vendus par des tiers, sauf indication contraire.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Commandes et Paiements</h2>
          <p>
            Les prix sont indiqués en FCFA. Le paiement est exigible immédiatement à la commande, sauf option de paiement à la livraison si disponible.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Responsabilité</h2>
          <p>
            Luxanda ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site ou de l'incapacité à l'utiliser.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Modifications</h2>
          <p>
            Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication sur le site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
          <p>
            Pour toute question concernant ces CGU, veuillez nous contacter à : contact@luxanda.bj
          </p>
        </section>
      </div>
    </Container>
  )
}
