# proofrev-agent-economics — JavaScript

Zero-runtime-dependency utilities for AI-agent commerce.

```js
import {
  scoreRevenueEvidence,
  computeNetMargin,
  assessZeroCapital
} from "proofrev-agent-economics";

const score = scoreRevenueEvidence({
  evidenceTier: "PAID_EXTERNAL_ONCHAIN_MAPPED",
  payerIndependenceVerified: true,
  serviceMappingVerified: true,
  linkedClusterRisk: 0,
  uniqueExternalBuyers: 3,
  repeatExternalBuyers: 1,
  settledRevenueUsd: 12.5
});

const margin = computeNetMargin({
  revenueUsd: 10,
  supplierUsd: 2,
  platformFeeUsd: 1,
  aiComputeUsd: 0.5
});

const structure = assessZeroCapital({
  structure: "ATOMIC_SPLIT",
  customerFundsCommitted: true,
  userWalletDebitRequired: false,
  termsPermitStructure: true,
  revenueUsd: 10,
  supplierUsd: 5,
  platformFeeUsd: 1
});
```

The library makes no network calls and stores no credentials.
It is an engineering utility, not accounting, legal, investment, or audit advice.
