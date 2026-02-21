import { Container } from '@/components/ui/Container'

export default function TermsPage() {
  return (
    <Container className="py-12">
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6">Conditions Générales d'Utilisation - Luxanda.bj</h1>
        <p className="text-gray-600 mb-4">Dernière mise à jour : 21 février 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Objet et acceptation</h2>
          <p>
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme 
            Luxanda.bj, marketplace de mise en relation entre vendeurs et acheteurs au Bénin.
          </p>
          <p className="mt-2">
            En créant un compte ou en utilisant la plateforme, vous acceptez sans réserve les présentes CGU.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Services proposés</h2>
          <p>
            Luxanda.bj est une plateforme de marketplace qui permet :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Aux vendeurs de créer une boutique et proposer des produits</li>
            <li>Aux acheteurs de découvrir les produits et contacter les vendeurs</li>
            <li>La mise en relation via WhatsApp pour finaliser les transactions</li>
            <li>La gestion d'abonnements vendeurs (Starter/Pro/Premium)</li>
          </ul>
          <p className="mt-3 text-orange-600 font-semibold">
            ⚠️ Luxanda n'intervient pas dans les transactions finales entre acheteurs et vendeurs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Inscription et comptes utilisateurs</h2>
          <p>
            L'inscription est obligatoire pour accéder aux fonctionnalités avancées :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Compte Acheteur (USER) :</strong> Gratuit, accès à tous les produits</li>
            <li><strong>Compte Vendeur (VENDOR) :</strong> Abonnement requis, 2 mois gratuits</li>
            <li><strong>Compte Administrateur (ADMIN) :</strong> Réservé à l'équipe Luxanda</li>
          </ul>
          <p className="mt-3">
            Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités 
            réalisées sous votre compte.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Abonnements vendeurs</h2>
          <p>
            Les plans d'abonnement vendeur sont les suivants :
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mt-3">
            <ul className="space-y-2">
              <li><strong>Starter :</strong> 5.000 FCFA/mois - Jusqu'à 20 produits</li>
              <li><strong>Pro :</strong> 15.000 FCFA/mois - Jusqu'à 100 produits</li>
              <li><strong>Premium :</strong> 30.000 FCFA/mois - Produits illimités</li>
            </ul>
          </div>
          <p className="mt-3">
            <strong>Offre spéciale lancement :</strong> 2 mois gratuits pour tout nouveau vendeur.
          </p>
          <p className="mt-2">
            Les abonnements sont prépayés mensuels via Kkiapay et non remboursables.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Obligations des vendeurs</h2>
          <p>
            En tant que vendeur sur Luxanda.bj, vous vous engagez à :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Fournir des informations exactes et à jour</li>
            <li>Proposer des produits conformes à la législation béninoise</li>
            <li>Ne pas vendre de produits illicites ou contrefaits</li>
            <li>Répondre aux demandes des acheteurs dans un délai raisonnable</li>
            <li>Respecter la charte vendeur de Luxanda</li>
            <li>Maintenir un abonnement actif pour continuer à vendre</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Obligations des acheteurs</h2>
          <p>
            En tant qu'acheteur sur Luxanda.bj, vous vous engagez à :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Fournir des informations authentiques lors de l'inscription</li>
            <li>Utiliser la plateforme à des fins personnelles et non commerciales</li>
            <li>Respecter les vendeurs et ne pas abuser du système de contact</li>
            <li>Finaliser les transactions directement avec les vendeurs</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Modalités de transaction</h2>
          <p>
            Les transactions sur Luxanda.bj suivent ce processus :
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Découverte des produits sur la plateforme</li>
            <li>Contact du vendeur via WhatsApp intégré</li>
            <li>Négociation et finalisation hors plateforme</li>
            <li>Paiement et livraison convenus directement entre les parties</li>
          </ol>
          <p className="mt-3 text-orange-600">
            Luxanda n'est pas partie prenante aux transactions finales et ne peut être tenu responsable 
            des litiges commerciaux entre acheteurs et vendeurs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Contenu et propriété intellectuelle</h2>
          <p>
            Les vendeurs conservent la propriété de leur contenu (photos, descriptions, prix).
          </p>
          <p className="mt-2">
            En publiant du contenu sur Luxanda, vous accordez une licence d'utilisation non exclusive 
            à la plateforme pour la promotion des produits.
          </p>
          <p className="mt-2">
            Il est interdit de copier, reproduire ou utiliser le contenu d'autres vendeurs sans autorisation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">9. Suspension et résiliation</h2>
          <p>
            Luxanda se réserve le droit de :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Suspendre temporairement un compte en cas de violation des CGU</li>
            <li>Résilier définitivement un compte pour faute grave</li>
            <li>Supprimer des produits non conformes</li>
            <li>Bloquer l'accès en cas d'abonnement expiré (vendeurs)</li>
          </ul>
          <p className="mt-3">
            En cas de résiliation, aucune indemnité ne sera due par Luxanda.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">10. Responsabilité</h2>
          <p>
            La responsabilité de Luxanda est limitée aux aspects techniques de la plateforme.
          </p>
          <p className="mt-2">
            Luxanda ne saurait être tenu responsable de :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>La qualité des produits et services des vendeurs</li>
            <li>Des litiges entre acheteurs et vendeurs</li>
            <li>Des pertes financières directes ou indirectes</li>
            <li>Des indisponibilités temporaires du service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">11. Protection des données</h2>
          <p>
            Conformément à la loi n°2009-10 du 23 juin 2009, vos données personnelles sont protégées.
          </p>
          <p className="mt-2">
            Pour plus d'informations, consultez notre <a href="/privacy" className="text-blue-600 underline">Politique de Confidentialité</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">12. Droit applicable et juridiction</h2>
          <p>
            Les présentes CGU sont soumises au droit béninois.
          </p>
          <p className="mt-2">
            Tout litige sera soumis aux tribunaux compétents de Cotonou, Bénin.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">13. Modifications</h2>
          <p>
            Luxanda se réserve le droit de modifier les présentes CGU à tout moment.
          </p>
          <p className="mt-2">
            Les modifications prendront effet dès leur publication sur la plateforme 
            et vous seront notifiées par email.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">14. Contact</h2>
          <p>
            Pour toute question concernant les CGU :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Email : luxanda@yahoo.com</li>
            <li>WhatsApp : +229 01 41 75 75 59</li>
            <li>Réponse sous 24h maximum</li>
          </ul>
        </section>

        <div className="bg-blue-50 p-6 rounded-lg mt-8">
          <p className="text-sm text-gray-700">
            <strong>Date d'entrée en vigueur :</strong> 21 février 2026<br/>
            En utilisant Luxanda.bj, vous reconnaissez avoir lu, compris et accepté 
            l'intégralité des présentes Conditions Générales d'Utilisation.
          </p>
        </div>
      </div>
    </Container>
  )
}
