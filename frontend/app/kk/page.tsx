import { Landing, landingMetadata } from "@/components/pages/Landing";

export const metadata = landingMetadata("kk");

export default function KkHomePage() {
  return <Landing locale="kk" />;
}
