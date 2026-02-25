export type ProjectStatus = "todo" | "in-progress" | "done";

export interface ProjectFormData {
  title: string;
  memo?: string;
  yarnType?: string;
  needleSize?: string;
  gauge?: string;
  patternUrl?: string;
  imageUrl?: string;
  progress?: number;
  difficulty?: number;
  tags?: string[];
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export const COLUMNS: { id: ProjectStatus; title: string }[] = [
  { id: "todo", title: "예정" },
  { id: "in-progress", title: "진행중" },
  { id: "done", title: "완료" },
];
