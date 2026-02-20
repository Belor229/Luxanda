export interface KkiapayTransaction {
    transactionId: string;
    status: string;
    amount: number;
    client_phone: string;
    reference: string;
    performed_at: string;
}

export async function verifyKkiapayTransaction(transactionId: string): Promise<KkiapayTransaction | null> {
    const apiKey = process.env.KKIAPAY_SECRET_KEY;
    if (!apiKey) {
        console.error('KKIAPAY_SECRET_KEY is not defined');
        return null;
    }

    try {
        const response = await fetch(`https://api.kkiapay.me/api/v1/transactions/status/${transactionId}`, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Kkiapay API error:', await response.text());
            return null;
        }

        const data = await response.json();

        // Kkiapay sandbox/live response structure validation
        if (data.status === 'SUCCESS' || data.status === 'FAILED') {
            return data;
        }

        return null;
    } catch (error) {
        console.error('Kkiapay verification error:', error);
        return null;
    }
}
