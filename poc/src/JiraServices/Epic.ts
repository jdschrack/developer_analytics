export default interface Epic {
  key: string;
  parent?: string;
  parentSummary?: string;
  summary: string;
  status: string;
  dueDate?: string;
  originalDueDate?: string | undefined;
  resolvedDate?: string;
  dueDateHistory?: EpicDueDateHistory[] | undefined;
}

export interface EpicDueDateHistory {
  from: Date | undefined;
  to: Date | undefined;
}
