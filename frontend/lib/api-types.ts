import type { Category, Platform } from "@/lib/categories";
import type { CampaignStatus, ApplicationStatus } from "@/lib/status";

export interface SocialLink {
  platform: Platform;
  url: string;
  followers: number | null;
}

export type SocialProofStatus = "PENDING" | "AUTO_APPROVED" | "APPROVED" | "REJECTED";

export interface SocialProofResponse {
  id: number;
  platform: Platform;
  postUrl: string;
  screenshotUrl: string | null;
  verificationCode: string;
  status: SocialProofStatus;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface SocialProofState {
  verificationCode: string;
  proof: SocialProofResponse | null;
}

export interface CreatorProfileResponse {
  id: number;
  email: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string;
  birthDate: string;
  categories: Category[];
  socials: SocialLink[];
  totalFollowers: number;
  telegramUrl: string | null;
  approved: boolean;
  socialProof: SocialProofResponse | null;
}

export interface BrandProfileResponse {
  id: number;
  email: string;
  companyName: string;
  bin: string;
  website: string | null;
  phone: string;
  contactName: string;
  approved: boolean;
}

export interface Stats {
  creators: number;
  brands: number;
  activeCampaigns: number;
  applications: number;
}

export interface AdminUser {
  id: number;
  email: string;
  role: "CREATOR" | "BRAND" | "ADMIN";
  banned: boolean;
  createdAt: string;
}

export type WalletTransactionType =
  | "REWARD"
  | "CAMPAIGN_PAYOUT"
  | "WITHDRAWAL"
  | "REFUND"
  | "ADJUSTMENT";

export interface WalletTransaction {
  id: number;
  amount: number;
  type: WalletTransactionType;
  description: string | null;
  createdAt: string;
}

export type WithdrawalStatus = "PENDING" | "PAID" | "REJECTED";

export interface WithdrawalItem {
  id: number;
  amount: number;
  status: WithdrawalStatus;
  requisites: string;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface WalletResponse {
  balance: number;
  minWithdrawal: number;
  canWithdraw: boolean;
  transactions: WalletTransaction[];
  withdrawals: WithdrawalItem[];
}

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationList {
  unread: number;
  items: NotificationItem[];
}

export interface AdminUserDetail {
  userId: number;
  email: string;
  role: "CREATOR" | "BRAND" | "ADMIN";
  banned: boolean;
  emailVerified: boolean;
  createdAt: string;
  walletBalance: number;
  creator: CreatorProfileResponse | null;
  brand: BrandProfileResponse | null;
  withdrawals: WithdrawalItem[];
}

export interface PublicCreatorProfile {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string;
  categories: Category[];
  socials: SocialLink[];
  totalFollowers: number;
  createdAt: string;
}

export interface CampaignSummary {
  id: number;
  title: string;
  brandName: string;
  category: Category;
  platforms: Platform[];
  rewardPerCreator: number;
  creatorsNeeded: number;
  slotsLeft: number;
  deadline: string;
  status: CampaignStatus;
  createdAt: string;
}

export interface CampaignCounters {
  applications: number;
  accepted: number;
  submitted: number;
  approved: number;
}

export interface CampaignFull {
  id: number;
  title: string;
  brandName: string;
  category: Category;
  platforms: Platform[];
  rewardPerCreator: number;
  creatorsNeeded: number;
  slotsLeft: number;
  deadline: string;
  status: CampaignStatus;
  createdAt: string;
  description: string;
  requirements: string;
  rejectReason: string | null;
  budget: number;
}

export interface BrandCampaignItem {
  campaign: CampaignSummary;
  counters: CampaignCounters;
}

export interface CampaignDetail {
  id: number;
  title: string;
  brandName: string;
  category: Category;
  platforms: Platform[];
  rewardPerCreator: number;
  creatorsNeeded: number;
  slotsLeft: number;
  deadline: string;
  status: CampaignStatus;
  createdAt: string;
  description: string;
  requirements: string;
  budget: number;
  myApplicationStatus: ApplicationStatus | null;
  canApply: boolean;
  applyBlockReason: string | null;
}

export interface CampaignFeedItem {
  campaign: CampaignSummary;
  myApplicationStatus: ApplicationStatus | null;
}

export interface MyApplication {
  id: number;
  status: ApplicationStatus;
  submissionUrl: string | null;
  rejectReason: string | null;
  resubmitUsed: boolean;
  appliedAt: string;
  campaign: CampaignSummary;
}

export interface BrandApplication {
  id: number;
  status: ApplicationStatus;
  submissionUrl: string | null;
  rejectReason: string | null;
  resubmitUsed: boolean;
  appliedAt: string;
  submittedAt: string | null;
  creator: CreatorProfileResponse;
}
