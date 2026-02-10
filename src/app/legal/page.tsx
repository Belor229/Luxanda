import React from 'react'

export default function LegalMentionsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-primary-blue">Mentions Légales</h1>

            <div className="space-y-8 text-gray-700">
                <section>
                    <h2 className="text-xl font-semibold mb-4">1. Éditeur de la plateforme</h2>
                    <p>
                        Le site <strong>Luxanda.bj</strong> est édité par la société Luxanda SAS, immatriculée au Registre du Commerce et des Sociétés sous le numéro [Numéro RCS].
                    </p>
                    <ul className="mt-2 text-sm">
                        <li><strong>Siège social :</strong> Cotonou, Bénin</li>
                        <li><strong>Email :</strong> contact@luxanda.bj</li>
                        <li><strong>Directeur de publication :</strong> DJAGBA Belor</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">2. Hébergement</h2>
                    <p>
                        La plateforme est hébergée par :
                    </p>
                    <ul className="mt-2 text-sm italic">
                        <li><strong>Hébergeur :</strong> Hostinger International Ltd.</li>
                        <li><strong>Siège :</strong> 61 Lordou Vironos Street, 6023 Larnaca, Cyprus</li>
                        <li><strong>Site Web :</strong> www.hostinger.com</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">3. Propriété intellectuelle</h2>
                    <p>
                        Tous les éléments graphiques, textuels et logos présents sur Luxanda sont la propriété exclusive de Luxanda ou de ses partenaires. Toute reproduction sans autorisation préalable est strictement interdite.
                    </p>
                </section>

                <section className="bg-gray-100 p-6 rounded-lg text-sm">
                    <p>
                        Luxanda s'engage à respecter les lois de la République du Bénin relatives au numérique et au commerce électronique.
                    </p>
                </section>
            </div>
        </div>
    )
}
