import test from "node:test";
import assert from "node:assert/strict";
import {scoreRevenueEvidence, computeNetMargin, assessZeroCapital} from "../src/index.js";

test("does not treat weak evidence as proven", () => {
  const r = scoreRevenueEvidence({
    evidenceTier:"LISTED_OR_402_ONLY",
    payerIndependenceVerified:false,
    serviceMappingVerified:true,
    settledRevenueUsd:0
  });
  assert.equal(r.provenWinnerEligible, false);
});

test("computes net margin", () => {
  const r = computeNetMargin({revenueUsd:10, supplierUsd:2, platformFeeUsd:1});
  assert.equal(r.netUsd, 7);
});

test("checks zero-capital structure", () => {
  const r = assessZeroCapital({
    structure:"ATOMIC_SPLIT",
    customerFundsCommitted:true,
    userWalletDebitRequired:false,
    termsPermitStructure:true,
    revenueUsd:10,
    supplierUsd:5,
    platformFeeUsd:1
  });
  assert.equal(r.zeroCapital, true);
});
