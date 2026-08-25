// Public outcome claims remain empty until evidence and publication permission
// have been reviewed. Pages should use conservative process descriptions unless
// an approved record is added here.
export const VERIFIED_PUBLIC_CLAIMS = Object.freeze([]);

export const REQUIRED_CLAIM_FIELDS = Object.freeze([
  'id',
  'approvedWording',
  'evidenceReference',
  'cohortOrDateRange',
  'methodology',
  'permissionReference',
  'verifiedOn',
  'reviewAfter',
  'approvedRoutes',
]);
