import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from proofrev_agent_economics import score_revenue_evidence, compute_net_margin, assess_zero_capital

def main():
    r = score_revenue_evidence({
        "evidenceTier":"LISTED_OR_402_ONLY",
        "payerIndependenceVerified":False,
        "serviceMappingVerified":True,
        "settledRevenueUsd":0
    })
    assert r["provenWinnerEligible"] is False

    m = compute_net_margin({"revenueUsd":10, "supplierUsd":2, "platformFeeUsd":1})
    assert m["netUsd"] == 7

    z = assess_zero_capital({
        "structure":"REFERRAL_OPERATOR_FEE",
        "customerFundsCommitted":True,
        "userWalletDebitRequired":False,
        "termsPermitStructure":True,
        "revenueUsd":5,
        "platformFeeUsd":0.5
    })
    assert z["zeroCapital"] is True
    print("PASS: Python core tests 3/3")

if __name__ == "__main__":
    main()
