-- Création de la table legal_acceptance
CREATE TABLE IF NOT EXISTS public.legal_acceptance (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cgu_version text NOT NULL,
    accepted_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.legal_acceptance ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own legal acceptance" ON public.legal_acceptance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own legal acceptance" ON public.legal_acceptance
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index pour performance
CREATE INDEX idx_legal_acceptance_user_id ON public.legal_acceptance(user_id);
CREATE INDEX idx_legal_acceptance_user_version ON public.legal_acceptance(user_id, cgu_version);

-- Commentaires
COMMENT ON TABLE public.legal_acceptance IS 'Table pour suivre l''acceptation des conditions générales d''utilisation par les utilisateurs';
COMMENT ON COLUMN public.legal_acceptance.user_id IS 'Référence à l''utilisateur authentifié';
COMMENT ON COLUMN public.legal_acceptance.cgu_version IS 'Version des CGU acceptées';
COMMENT ON COLUMN public.legal_acceptance.accepted_at IS 'Date et heure de l''acceptation';
