import type { Category, Platform } from "@/lib/categories";
import type { CampaignStatus, ApplicationStatus } from "@/lib/status";

export interface SocialLink {
  platform: Platform;
  url: string;
  followers: number | null;
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
