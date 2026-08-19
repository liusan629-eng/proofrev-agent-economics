# proofrev-agent-economics — Python

Zero-runtime-dependency utilities for AI-agent commerce.

```python
from proofrev_agent_economics import (
    score_revenue_evidence,
    compute_net_margin,
    assess_zero_capital,
)

score = score_revenue_evidence({
    "evidenceTier": "PAID_EXTERNAL_ONCHAIN_MAPPED",
    "payerIndependenceVerified": True,
    "serviceMappingVerified": True,
    "linkedClusterRisk": 0,
    "uniqueExternalBuyers": 3,
    "repeatExternalBuyers": 1,
    "settledRevenueUsd": 12.5,
})

margin = compute_net_margin({
    "revenueUsd": 10,
    "supplierUsd": 2,
    "platformFeeUsd": 1,
    "aiComputeUsd": 0.5,
})
```

The library makes no network calls and stores no credentials.
It is an engineering utility, not accounting, legal, investment, or audit advice.
