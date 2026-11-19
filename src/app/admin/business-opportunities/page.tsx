import { redirect } from "next/navigation";

/** Default Lead generation landing = Discover (country / city / category chips). */
export default function BusinessOpportunitiesOverviewPage() {
  redirect("/admin/business-opportunities/discover");
}
