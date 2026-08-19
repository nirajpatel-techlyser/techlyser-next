-- Enable Row Level Security on all public tables.
-- Techlyser uses Prisma server-side (DATABASE_URL / postgres role) — not Supabase JS client.
-- With RLS on and no permissive policies for anon/authenticated, PostgREST/Data API access is blocked.
-- The postgres/service connection used by Prisma bypasses RLS (Supabase default).

ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Blog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PageView" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "BlogComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SiteSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Keyword" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Topic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Competitor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Research" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ResearchItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Opportunity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ContentIdea" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PublishingQueue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ContentCluster" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ContentPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ContentPlanItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AiSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PromptTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AiAnalytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AiSeoGeoRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AiWriterRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AiAgentRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AiMemory" ENABLE ROW LEVEL SECURITY;

-- Defense in depth: revoke direct table grants from API roles (if present).
REVOKE ALL ON TABLE "User" FROM anon, authenticated;
REVOKE ALL ON TABLE "Account" FROM anon, authenticated;
REVOKE ALL ON TABLE "Session" FROM anon, authenticated;
REVOKE ALL ON TABLE "VerificationToken" FROM anon, authenticated;
REVOKE ALL ON TABLE "Blog" FROM anon, authenticated;
REVOKE ALL ON TABLE "PageView" FROM anon, authenticated;
REVOKE ALL ON TABLE "BlogComment" FROM anon, authenticated;
REVOKE ALL ON TABLE "SiteSettings" FROM anon, authenticated;
REVOKE ALL ON TABLE "Keyword" FROM anon, authenticated;
REVOKE ALL ON TABLE "Topic" FROM anon, authenticated;
REVOKE ALL ON TABLE "Competitor" FROM anon, authenticated;
REVOKE ALL ON TABLE "Research" FROM anon, authenticated;
REVOKE ALL ON TABLE "ResearchItem" FROM anon, authenticated;
REVOKE ALL ON TABLE "Opportunity" FROM anon, authenticated;
REVOKE ALL ON TABLE "ContentIdea" FROM anon, authenticated;
REVOKE ALL ON TABLE "PublishingQueue" FROM anon, authenticated;
REVOKE ALL ON TABLE "ContentCluster" FROM anon, authenticated;
REVOKE ALL ON TABLE "ContentPlan" FROM anon, authenticated;
REVOKE ALL ON TABLE "ContentPlanItem" FROM anon, authenticated;
REVOKE ALL ON TABLE "AiSettings" FROM anon, authenticated;
REVOKE ALL ON TABLE "PromptTemplate" FROM anon, authenticated;
REVOKE ALL ON TABLE "AiAnalytics" FROM anon, authenticated;
REVOKE ALL ON TABLE "AiSeoGeoRun" FROM anon, authenticated;
REVOKE ALL ON TABLE "AiWriterRun" FROM anon, authenticated;
REVOKE ALL ON TABLE "AiAgentRun" FROM anon, authenticated;
REVOKE ALL ON TABLE "AiMemory" FROM anon, authenticated;
