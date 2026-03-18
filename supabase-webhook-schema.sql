-- Table pour les logs de webhooks
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    transaction_id text,
    status text NOT NULL,
    payload jsonb,
    processed_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction ON public.webhook_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON public.webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_at ON public.webhook_logs(processed_at);

-- Politiques RLS pour webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.vendors 
            WHERE user_id::uuid = auth.uid() AND status = 'APPROVED'
        )
    );

-- Table pour les abonnements améliorée
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS amount integer;

-- Index pour les abonnements
CREATE INDEX IF NOT EXISTS idx_subscriptions_vendor ON public.subscriptions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_dates ON public.subscriptions(start_date, end_date);
