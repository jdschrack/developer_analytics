import PullRequest from './PullRequest';

export type PullMetrics = {[month: string]: {[status: string]: Array<PullRequest>}};

export interface PullMetricStats {
  date: Date;
  open: number;
  closed: number;
  merged: number;
}