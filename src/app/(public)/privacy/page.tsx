import { Container } from '@/components/ui/Container'

export default function PrivacyPage() {
  return (
    <Container className="py-12">
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité - Luxanda.bj</h1>
        <p className="text-gray-600 mb-4">Dernière mise à jour : 21 février 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Données personnelles collectées</h2>
          <p>
            Conformément à la loi n°2009-10 du 23 juin 2009 relative à la protection des données personnelles au Bénin, 
            Luxanda collecte les informations suivantes :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Identité :</strong> Nom, prénom, email, téléphone</li>
            <li><strong>Profil vendeur :</strong> Nom boutique, description, localisation</li>
            <li><strong>Transactions :</strong> Historique abonnements, paiements Kkiapay</li>
            <li><strong>Navigation :</strong> Adresse IP, cookies, données analytiques</li>
            <li><strong>Support :</strong> Messages WhatsApp, emails de support</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Finalités du traitement</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Gérer votre compte et abonnement vendeur</li>
            <li>Faciliter la mise en relation avec les vendeurs</li>
            <li>Traiter les paiements via Kkiapay</li>
            <li>Assurer le support client (24h maximum)</li>
            <li>Respecter nos obligations légales et fiscales</li>
            <li>Améliorer la plateforme et prévenir la fraude</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Base légale et conservation</h2>
          <p>
            Le traitement de vos données repose sur :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Consentement :</strong> Création compte, abonnement</li>
            <li><strong>Exécution contrat :</strong> Services marketplace</li>
            <li><strong>Obligation légale :</strong> Facturation, lutte anti-blanchiment</li>
          </ul>
          <p className="mt-3">
            <strong>Durées de conservation :</strong><br/>
            - Comptes utilisateurs : 2 ans après inactivité<br/>
            - Données transactionnelles : 10 ans (obligation fiscale)<br/>
            - Cookies session : 30 jours<br/>
            - Messages support : 1 an
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Destinataires des données</h2>
          <p>
            Vos données peuvent être partagées avec :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Kkiapay :</strong> Traitement paiements sécurisés</li>
            <li><strong>Supabase :</strong> Hébergement base de données (UE)</li>
            <li><strong>Vercel :</strong> Hébergement plateforme (USA)</li>
            <li><strong>Support WhatsApp :</strong> Messages client</li>
            <li><strong>Autorités béninoises :</strong> Sur réquisition judiciaire</li>
          </ul>
          <p className="mt-3 text-orange-600 font-semibold">
            Aucune vente de données à des tiers à des fins commerciales.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Sécurité et protection</h2>
          <p>
            Luxanda met en œuvre des mesures techniques et organisationnelles :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Chiffrement SSL/TLS (HTTPS obligatoire)</li>
            <li>Row Level Security (RLS) sur base de données</li>
            <li>Authentification forte via Supabase Auth</li>
            <li>Sauvegardes journalières chiffrées</li>
            <li>Contrôle d'accès par rôle (USER/VENDOR/ADMIN)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Vos droits RGPD Bénin</h2>
          <p>
            Conformément à l'article 12 de la loi 2009-10, vous disposez de :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Droit d'accès :</strong> Savoir quelles données nous détenons</li>
            <li><strong>Droit de rectification :</strong> Corriger vos informations</li>
            <li><strong>Droit d'effacement :</strong> Supprimer votre compte</li>
            <li><strong>Droit de limitation :</strong> Suspendre le traitement</li>
            <li><strong>Droit de portabilité :</strong> Exporter vos données</li>
            <li><strong>Droit d'opposition :</strong> Refuser certains traitements</li>
          </ul>
          <p className="mt-3">
            <strong>Pour exercer ces droits :</strong><br/>
            Email : luxanda@yahoo.com<br/>
            WhatsApp : +229 01 41 75 75 59<br/>
            Réponse sous 30 jours maximum
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Cookies et tracking</h2>
          <p>
            Notre site utilise :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Cookies essentiels :</strong> Navigation, authentification</li>
            <li><strong>Cookies analytics :</strong> Google Analytics (anonymisé)</li>
            <li><strong>Cookies fonctionnels :</strong> Préférences utilisateur</li>
          </ul>
          <p className="mt-3">
            Vous pouvez refuser les cookies non essentiels via votre navigateur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Transferts internationaux</h2>
          <p>
            Les données sont hébergées chez Supabase (Union Européenne) et Vercel (USA) 
            avec des garanties adéquates (Privacy Shield, clauses contractuelles types).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">9. Contact DPO</h2>
          <p>
            <strong>Délégué à la Protection des Données :</strong><br/>
            DJAGBA Belor<br/>
            Email : dpo@luxanda.bj<br/>
            Téléphone : +229 01 41 75 75 59<br/>
            Adresse : Cotonou, Bénin
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">10. Réclamations</h3>
          <p>
            En cas de litige, vous pouvez contacter :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>L'ILC Bénin (Institut Légal et Cosmétique)</li>
            <li>L'ARCEP Bénin (Autorité de Régulation)</li>
            <li>Les tribunaux compétents de Cotonou</li>
          </ul>
        </section>

        <div className="bg-gray-100 p-6 rounded-lg mt-8">
          <p className="text-sm text-gray-600">
            Cette politique s'applique à tous les utilisateurs de la plateforme Luxanda.bj 
            et peut être modifiée pour respecter l'évolution légale et technique. 
            Les modifications vous seront notifiées par email.
          </p>
        </div>
      </div>
    </Container>
  )
}
