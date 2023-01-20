export default interface PullRequest {
  id: number;
  title: string;
  url: string;
  state: string;
  created_at: Date;
  updated_at?: Date;
  closed_at?: Date;
  merged_at?: Date;

}