import type { StatusTone } from "@/components/ui/StatusPill";

export type CampaignStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "CLOSED"
  | "REJECTED";

export type ApplicationStatus =
  | "APPLIED"
  | "ACCEPTED"
  | "DECLINED"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

export const campaignStatusPill: Record<
  CampaignStatus,
  { label: string; tone: StatusTone }
> = {
  DRAFT: { label: "Черновик", tone: "dim" },
  PENDING_REVIEW: { label: "На модерации", tone: "warning" },
  ACTIVE: { label: "Активна", tone: "success" },
  CLOSED: { label: "Закрыта", tone: "dim" },
  REJECTED: { label: "Отклонена", tone: "error" },
};

export const applicationStatusPill: Record<
  ApplicationStatus,
  { label: string; tone: StatusTone }
> = {
  APPLIED: { label: "Отклик отправлен", tone: "accent" },
  ACCEPTED: { label: "Принят", tone: "success" },
  DECLINED: { label: "Отклонён", tone: "error" },
  SUBMITTED: { label: "Сдано на проверку", tone: "warning" },
  APPROVED: { label: "Одобрено", tone: "success" },
  REJECTED: { label: "Отклонено", tone: "error" },
};
