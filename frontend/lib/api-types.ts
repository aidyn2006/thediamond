import type { PhoneBrand, PhoneCondition } from "@/lib/phones";
import type { DealStatus, ListingStatus } from "@/lib/status";

/** Mirrors the backend DTOs in `com.thediamond.api.dto`. */

export interface ListingSummary {
  id: number;
  title: string;
  brand: PhoneBrand;
  model: string;
  storageGb: number | null;
  condition: PhoneCondition;
  batteryHealth: number | null;
  price: number;
  city: string;
  coverUrl: string | null;
  status: ListingStatus;
  views: number;
  createdAt: string;
}

export interface MyListingItem {
  listing: ListingSummary;
  dealRequests: number;
  favorites: number;
  rejectReason: string | null;
}

export interface SellerCard {
  id: number;
  displayName: string;
  avatarUrl: string | null;
  city: string | null;
  /** Null until the seller accepts your purchase request. */
  phone: string | null;
  memberSince: string;
  activeListings: number;
}

export interface ListingDetail {
  id: number;
  title: string;
  brand: PhoneBrand;
  model: string;
  storageGb: number | null;
  ramGb: number | null;
  color: string | null;
  condition: PhoneCondition;
  batteryHealth: number | null;
  price: number;
  city: string;
  description: string;
  status: ListingStatus;
  views: number;
  createdAt: string;
  images: string[];
  seller: SellerCard;
  isMine: boolean;
  favorite: boolean;
  myDealStatus: DealStatus | null;
  canRequest: boolean;
  requestBlockReason: string | null;
}

/** Unauthenticated listing card — no seller phone. */
export interface PublicListing {
  id: number;
  title: string;
  brand: PhoneBrand;
  model: string;
  storageGb: number | null;
  ramGb: number | null;
  color: string | null;
  condition: PhoneCondition;
  batteryHealth: number | null;
  price: number;
  city: string;
  description: string;
  images: string[];
  sellerName: string;
  sellerId: number;
  createdAt: string;
}

/** Sitemap row for a seller with at least one active listing. */
export interface SellerRef {
  id: number;
  updatedAt: string;
}

export interface PublicSeller {
  id: number;
  displayName: string;
  avatarUrl: string | null;
  city: string | null;
  about: string | null;
  memberSince: string;
  listings: ListingSummary[];
}

export interface DealItem {
  id: number;
  listing: ListingSummary;
  status: DealStatus;
  message: string | null;
  counterpartName: string;
  /** Null until the deal is accepted. */
  counterpartPhone: string | null;
  counterpartId: number;
  iAmSeller: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface ProfileResponse {
  id: number;
  email: string;
  displayName: string;
  phone: string;
  city: string;
  avatarUrl: string | null;
  about: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
}

export interface AdminUserDetail {
  userId: number;
  email: string;
  role: string;
  banned: boolean;
  emailVerified: boolean;
  createdAt: string;
  profile: ProfileResponse | null;
  listings: ListingSummary[];
}

export interface StatsResponse {
  users: number;
  activeListings: number;
  pendingListings: number;
  deals: number;
}

/** Catalog filter query, shared by the client filter bar and the server fetchers. */
export interface CatalogFilters {
  brand?: string;
  condition?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  minStorage?: string;
  q?: string;
}
