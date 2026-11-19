-- Public share URLs: /{publicCategorySlug}/{publicHandle}
ALTER TABLE "BusinessOpportunity" ADD COLUMN IF NOT EXISTS "publicCategorySlug" TEXT;
ALTER TABLE "BusinessOpportunity" ADD COLUMN IF NOT EXISTS "publicHandle" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "BusinessOpportunity_publicCategorySlug_publicHandle_key"
  ON "BusinessOpportunity"("publicCategorySlug", "publicHandle");

CREATE INDEX IF NOT EXISTS "BusinessOpportunity_publicHandle_idx"
  ON "BusinessOpportunity"("publicHandle");
