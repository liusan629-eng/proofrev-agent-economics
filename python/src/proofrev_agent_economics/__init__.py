from math import log1p

EVIDENCE_WEIGHTS = {
    "PAID_EXTERNAL_ONCHAIN_MAPPED": 1.00,
    "PAID_PLATFORM_SETTLED": 0.95,
    "PAYABLE_ACCEPTED": 0.70,
    "ESCROWED_CLAIMABLE": 0.50,
    "MULTI_BUYER_MARKET_ACTIVITY": 0.40,
    "LISTED_OR_402_ONLY": 0.10,
    "SELF_FUNDED_OR_TEST": 0.00,
    "NONE": 0.00,
}

def _clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, float(x)))

def score_revenue_evidence(data):
    tier = str(data.get("evidenceTier", "NONE"))
    base = EVIDENCE_WEIGHTS.get(tier, 0.0)
    independent = bool(data.get("payerIndependenceVerified", False))
    mapped = bool(data.get("serviceMappingVerified", False))
    linked_risk = _clamp(data.get("linkedClusterRisk", 0.0))
    buyers = max(0, int(data.get("uniqueExternalBuyers", 0)))
    repeats = max(0, int(data.get("repeatExternalBuyers", 0)))
    settled = max(0.0, float(data.get("settledRevenueUsd", 0)))

    authenticity = 1.0
    if not independent:
        authenticity *= 0.65
    if not mapped:
        authenticity *= 0.70
    authenticity *= 1.0 - linked_risk

    evidence_score = base * authenticity
    diversity = _clamp(log1p(buyers) / log1p(50))
    repeat_rate = _clamp(repeats / buyers) if buyers else 0.0
    score = 100 * (0.75 * evidence_score + 0.15 * diversity + 0.10 * repeat_rate)

    flags = []
    if tier == "SELF_FUNDED_OR_TEST":
        flags.append("self_or_test_payment")
    if tier == "LISTED_OR_402_ONLY":
        flags.append("no_settled_revenue_proof")
    if not independent:
        flags.append("payer_independence_unverified")
    if not mapped:
        flags.append("service_to_payment_mapping_unverified")
    if linked_risk >= 0.25:
        flags.append("linked_cluster_risk")
    if settled <= 0:
        flags.append("no_positive_settled_revenue")

    return {
        "authenticityScore": round(score, 2),
        "evidenceTier": tier,
        "evidenceScore": round(evidence_score, 4),
        "redFlags": flags,
        "provenWinnerEligible":
            tier in {"PAID_EXTERNAL_ONCHAIN_MAPPED", "PAID_PLATFORM_SETTLED"}
            and independent and mapped and settled > 0 and evidence_score >= 0.55
    }

def compute_net_margin(data):
    revenue = float(data.get("revenueUsd", 0))
    cost_keys = [
        "supplierUsd", "platformFeeUsd", "paymentFeeUsd",
        "aiComputeUsd", "refundReserveUsd", "otherVariableUsd"
    ]
    costs = sum(float(data.get(k, 0)) for k in cost_keys)
    net = revenue - costs
    return {
        "revenueUsd": round(revenue, 6),
        "variableCostUsd": round(costs, 6),
        "netUsd": round(net, 6),
        "netMarginPct": round(net / revenue * 100, 4) if revenue else 0.0,
        "profitable": net > 0
    }

def assess_zero_capital(data):
    allowed = {
        "ATOMIC_SPLIT",
        "CUSTOMER_ESCROW_PAYS_SUPPLIER",
        "REFERRAL_OPERATOR_FEE",
        "POST_DELIVERY_SUPPLIER_TERMS",
        "ZERO_COST_OWNED_SUPPLY"
    }
    structure = str(data.get("structure", ""))
    committed = bool(data.get("customerFundsCommitted", False))
    wallet_debit = bool(data.get("userWalletDebitRequired", False))
    terms_ok = bool(data.get("termsPermitStructure", False))
    margin = compute_net_margin(data)

    blockers = []
    if structure not in allowed: blockers.append("unsupported_structure")
    if not committed: blockers.append("customer_funds_not_committed")
    if wallet_debit: blockers.append("user_wallet_debit_required")
    if not terms_ok: blockers.append("terms_not_verified")
    if margin["netUsd"] <= 0: blockers.append("non_positive_margin")

    return {
        "structure": structure,
        "zeroCapital": not blockers,
        "margin": margin,
        "blockers": blockers
    }
