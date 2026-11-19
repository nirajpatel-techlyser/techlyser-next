import OpportunitiesSubnav from "@/components/admin/business-opportunities/OpportunitiesSubnav";

export default function BusinessOpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Lead generation</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Pick country, city, and category (button chips), discover local
          businesses, draft website concepts, and share public landing links.
          Emails are drafts only — never auto-sent.
        </p>
      </header>
      <OpportunitiesSubnav />
      {children}
    </div>
  );
}
