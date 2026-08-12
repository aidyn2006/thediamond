import { Landing, landingMetadata } from "@/components/pages/Landing";

export const metadata = landingMetadata("ru");

export default function HomePage() {
  return <Landing locale="ru" />;
}
