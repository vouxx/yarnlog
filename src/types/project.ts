export type ProjectStatus = "todo" | "in-progress" | "done";

export interface StitchCounter {
  id: string;
  name: string;
  value: number;
}

export interface YarnInfo {
  name: string;
  color?: string;
  weight?: string;
  quantity?: string;
}

export interface NeedleInfo {
  type: string;
  size: string;
}

export interface SupplyInfo {
  name: string;
  quantity?: string;
  note?: string;
}

export interface Attachment {
  id: string;
  type: "image" | "pdf" | "youtube" | "url";
  url: string;
  name: string;
}

export interface ProjectFormData {
  title: string;
  memo?: string;
  gauge?: string;
  yarns?: YarnInfo[];
  needles?: NeedleInfo[];
  supplies?: SupplyInfo[];
  attachments?: Attachment[];
  progress?: number;
  difficulty?: number;
  tags?: string[];
  folder?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export const COLUMNS: { id: ProjectStatus; title: string }[] = [
  { id: "todo", title: "예정" },
  { id: "in-progress", title: "진행중" },
  { id: "done", title: "완료" },
];
