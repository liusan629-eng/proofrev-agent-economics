const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number(x)));

const EVIDENCE_WEIGHTS = Object.freeze({
  PAID_EXTERNAL_ONCHAIN_MAPPED: 1.00,
  PAID_PLATFORM_SETTLED: 0.95,
  PAYABLE_ACCEPTED: 0.70,
  ESCROWED_CLAIMABLE: 0.50,
  MULTI_BUYER_MARKET_ACTIVITY: 0.40,
  LISTED_OR_402_ONLY: 0.10,
  SELF_FUNDED_OR_TEST: 0.00,
  NONE: 0.00
});

export function scoreRevenueEvidence(input = {}) {
  const tier = String(input.evidenceTier ?? "NONE");
  const base = EVIDENCE_WEIGHTS[tier] ?? 0;
  const independent = Boolean(input.payerIndependenceVerified);
  const mapped = Boolean(input.serviceMappingVerified);
  const linkedRisk = clamp(input.linkedClusterRisk ?? 0);
  const buyers = Math.max(0, Number(input.uniqueExternalBuyers ?? 0));
  const repeats = Math.max(0, Number(input.repeatExternalBuyers ?? 0));
  const settled = Math.max(0, Number(input.settledRevenueUsd ?? 0));

  let authenticity = 1;
  if (!independent) authenticity *= 0.65;
  if (!mapped) authenticity *= 0.70;
  authenticity *= (1 - linkedRisk);

  const evidenceScore = base * authenticity;
  const diversity = clamp(Math.log1p(buyers) / Math.log1p(50));
  const repeatRate = buyers > 0 ? clamp(repeats / buyers) : 0;
  const score = 100 * (0.75 * evidenceScore + 0.15 * diversity + 0.10 * repeatRate);

  const redFlags = [];
  if (tier === "SELF_FUNDED_OR_TEST") redFlags.push("self_or_test_payment");
  if (tier === "LISTED_OR_402_ONLY") redFlags.push("no_settled_revenue_proof");
  if (!independent) redFlags.push("payer_independence_unverified");
  if (!mapped) redFlags.push("service_to_payment_mapping_unverified");
  if (linkedRisk >= 0.25) redFlags.push("linked_cluster_risk");
  if (settled <= 0) redFlags.push("no_positive_settled_revenue");

  return {
    authenticityScore: Math.round(score * 100) / 100,
    evidenceTier: tier,
    evidenceScore: Math.round(evidenceScore * 10000) / 10000,
    redFlags,
    provenWinnerEligible:
      ["PAID_EXTERNAL_ONCHAIN_MAPPED", "PAID_PLATFORM_SETTLED"].includes(tier) &&
      independent && mapped && settled > 0 && evidenceScore >= 0.55
  };
}

export function computeNetMargin(input = {}) {
  const revenue = Number(input.revenueUsd ?? 0);
  const costs = [
    "supplierUsd", "platformFeeUsd", "paymentFeeUsd",
    "aiComputeUsd", "refundReserveUsd", "otherVariableUsd"
  ].reduce((sum, key) => sum + Number(input[key] ?? 0), 0);

  const net = revenue - costs;
  return {
    revenueUsd: +revenue.toFixed(6),
    variableCostUsd: +costs.toFixed(6),
    netUsd: +net.toFixed(6),
    netMarginPct: revenue > 0 ? +(net / revenue * 100).toFixed(4) : 0,
    profitable: net > 0
  };
}

export function assessZeroCapital(input = {}) {
  const allowedStructure = new Set([
    "ATOMIC_SPLIT",
    "CUSTOMER_ESCROW_PAYS_SUPPLIER",
    "REFERRAL_OPERATOR_FEE",
    "POST_DELIVERY_SUPPLIER_TERMS",
    "ZERO_COST_OWNED_SUPPLY"
  ]);

  const structure = String(input.structure ?? "");
  const customerFundsCommitted = Boolean(input.customerFundsCommitted);
  const userWalletDebitRequired = Boolean(input.userWalletDebitRequired);
  const termsPermitStructure = Boolean(input.termsPermitStructure);
  const margin = computeNetMargin(input);

  const blockers = [];
  if (!allowedStructure.has(structure)) blockers.push("unsupported_structure");
  if (!customerFundsCommitted) blockers.push("customer_funds_not_committed");
  if (userWalletDebitRequired) blockers.push("user_wallet_debit_required");
  if (!termsPermitStructure) blockers.push("terms_not_verified");
  if (margin.netUsd <= 0) blockers.push("non_positive_margin");

  return {
    structure,
    zeroCapital: blockers.length === 0,
    margin,
    blockers
  };
}
