export type Role = "USER" | "ADMIN";

export interface UserSummary {
  id: number;
  email: string;
  role: Role;
  banned: boolean;
  emailVerified: boolean;
  /** Contact profile filled — required before posting a listing or requesting a purchase. */
  onboardingComplete: boolean;
}

/** Where each role lands after login / from the app root. */
export function roleHome(role: Role): string {
  return role === "ADMIN" ? "/admin" : "/listings";
}
