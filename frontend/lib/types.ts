export type Role = "CREATOR" | "BRAND" | "ADMIN";

export interface UserSummary {
  id: number;
  email: string;
  role: Role;
  banned: boolean;
  onboardingComplete: boolean;
  approved: boolean;
}

/** Where each role lands after login / from the app root. */
export function roleHome(role: Role): string {
  switch (role) {
    case "CREATOR":
      return "/campaigns";
    case "BRAND":
      return "/dashboard";
    case "ADMIN":
      return "/admin";
  }
}
