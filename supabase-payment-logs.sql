-- Payment Logs Table for Transaction Security
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    transactionId TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')),
    amount DOUBLE PRECISION,
    expectedAmount DOUBLE PRECISION,
    plan TEXT,
    clientPhone TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Payment Logs - Self Read" ON public.payment_logs FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Payment Logs - Self Insert" ON public.payment_logs FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Payment Logs - Admin All" ON public.payment_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Index for performance
CREATE INDEX idx_payment_logs_transactionId ON public.payment_logs(transactionId);
CREATE INDEX idx_payment_logs_userId ON public.payment_logs("userId");
CREATE INDEX idx_payment_logs_status ON public.payment_logs(status);
