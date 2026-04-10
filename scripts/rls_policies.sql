-- RLS Policies for Luxanda

-- 1. Table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.users FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- 2. Table vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active vendors" 
ON public.vendors FOR SELECT 
USING (status = 'APPROVED');

CREATE POLICY "Vendors can view their own data" 
ON public.vendors FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all vendors" 
ON public.vendors FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- 3. Table products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products" 
ON public.products FOR SELECT 
USING (status = 'ACTIVE');

CREATE POLICY "Admins can manage all products" 
ON public.products FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- 4. Table admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view logs" 
ON public.admin_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

CREATE POLICY "Only admins can insert logs" 
ON public.admin_logs FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- 5. Table identity_docs
ALTER TABLE public.identity_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view identity docs" 
ON public.identity_docs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

CREATE POLICY "Vendors can upload their own docs" 
ON public.identity_docs FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vendors 
    WHERE id = vendor_id AND user_id = auth.uid()
  )
);

-- 6. Table finance_transactions
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all transactions" 
ON public.finance_transactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

CREATE POLICY "Users can view their own transactions" 
ON public.finance_transactions FOR SELECT 
USING (auth.uid() = user_id);
