-- PayTR credit purchase integrity. Additive and safe to apply to existing data.
CREATE UNIQUE INDEX IF NOT EXISTS purchases_external_payment_id_unique
  ON public.purchases (external_payment_id)
  WHERE external_payment_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS credit_ledger_purchase_credit_once
  ON public.credit_ledger (workspace_id, reference_id)
  WHERE reason = 'purchase_credit' AND reference_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.apply_paytr_purchase(
  p_merchant_oid text,
  p_total_amount integer
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_purchase public.purchases%ROWTYPE;
BEGIN
  SELECT * INTO v_purchase FROM public.purchases
  WHERE external_payment_id = p_merchant_oid AND provider = 'paytr'
  FOR UPDATE;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;
  IF v_purchase.amount_minor <> p_total_amount OR v_purchase.currency <> 'TRY' THEN RETURN 'amount_mismatch'; END IF;
  IF v_purchase.status = 'paid' THEN RETURN 'already_paid'; END IF;
  IF v_purchase.status <> 'pending' THEN RETURN 'not_pending'; END IF;
  UPDATE public.credit_accounts SET balance = balance + v_purchase.credits, updated_at = now()
  WHERE workspace_id = v_purchase.workspace_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'CREDIT_ACCOUNT_NOT_FOUND'; END IF;
  INSERT INTO public.credit_ledger (workspace_id, amount, reason, reference_id)
  VALUES (v_purchase.workspace_id, v_purchase.credits, 'purchase_credit', v_purchase.id::text);
  UPDATE public.purchases SET status = 'paid' WHERE id = v_purchase.id;
  RETURN 'credited';
END;
$$;
REVOKE ALL ON FUNCTION public.apply_paytr_purchase(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_paytr_purchase(text, integer) TO service_role;
