import React from 'react'

export default function RefundPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-primary-orange">Politique de Remboursement</h1>

            <div className="prose max-w-none text-gray-700 space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4">1. Principe de base</h2>
                    <p>
                        Chez Luxanda, nous voulons que vous soyez entièrement satisfait de vos achats. Si un produit ne répond pas à vos attentes, nous sommes là pour vous aider.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">2. Conditions de retour</h2>
                    <p>Vous disposez d'un délai de 48 heures après réception de votre commande pour demander un retour si :</p>
                    <ul className="list-disc pl-6">
                        <li>Le produit est endommagé ou défectueux à l'arrivée.</li>
                        <li>Le produit ne correspond pas à la description fournie par le vendeur.</li>
                        <li>Le produit reçu n'est pas celui que vous avez commandé.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">3. Procédure de remboursement</h2>
                    <p>
                        Une fois le retour validé par Luxanda, le remboursement sera effectué sous 3 à 5 jours ouvrables via le mode de paiement original ou sous forme de bon d'achat, selon votre préférence.
                    </p>
                </section>

                <section className="bg-orange-50 p-6 rounded-lg text-sm italic">
                    <p>
                        Note : Les frais de livraison ne sont généralement pas remboursables, sauf si Luxanda ou le vendeur est responsable de l'erreur.
                    </p>
                </section>
            </div>
        </div>
    )
}
