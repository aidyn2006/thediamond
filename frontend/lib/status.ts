import type { StatusTone } from "@/components/ui/StatusPill";

export type ListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "SOLD"
  | "ARCHIVED"
  | "REJECTED";

export type DealStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "COMPLETED"
  | "CANCELLED";

export const listingStatusPill: Record<ListingStatus, { label: string; tone: StatusTone }> = {
  DRAFT: { label: "Черновик", tone: "dim" },
  PENDING_REVIEW: { label: "На проверке", tone: "warning" },
  ACTIVE: { label: "Опубликовано", tone: "success" },
  SOLD: { label: "Продано", tone: "accent" },
  ARCHIVED: { label: "В архиве", tone: "dim" },
  REJECTED: { label: "Отклонено", tone: "error" },
};

export const dealStatusPill: Record<DealStatus, { label: string; tone: StatusTone }> = {
  REQUESTED: { label: "Ждёт ответа", tone: "warning" },
  ACCEPTED: { label: "Принята", tone: "success" },
  DECLINED: { label: "Отклонена", tone: "error" },
  COMPLETED: { label: "Завершена", tone: "accent" },
  CANCELLED: { label: "Отменена", tone: "dim" },
};
