export interface PullResult {
  url:                string;
  repository_url:     string;
  labels_url:         string;
  comments_url:       string;
  events_url:         string;
  html_url:           string;
  id:                 number;
  node_id:            string;
  number:             number;
  title:              string;
  user:               User;
  labels:             Label[];
  state:              string;
  assignee:           null;
  milestone:          Milestone;
  comments:           number;
  created_at:         Date;
  updated_at:         Date;
  closed_at?:         Date;
  pull_request:       PullRequest;
  body:               string;
  score:              number;
  locked:             boolean;
  author_association: string;
  state_reason:       string;
}

export interface Label {
  id:      number;
  node_id: string;
  url:     string;
  name:    string;
  color:   string;
}

export interface Milestone {
  url:           string;
  html_url:      string;
  labels_url:    string;
  id:            number;
  node_id:       string;
  number:        number;
  state:         string;
  title:         string;
  description:   string;
  creator:       User;
  open_issues:   number;
  closed_issues: number;
  created_at:    Date;
  updated_at:    Date;
  closed_at:     Date;
  due_on:        Date;
}

export interface User {
  login:               string;
  id:                  number;
  node_id:             string;
  avatar_url:          string;
  gravatar_id:         string;
  url:                 string;
  html_url:            string;
  followers_url:       string;
  following_url:       string;
  gists_url:           string;
  starred_url:         string;
  subscriptions_url:   string;
  organizations_url:   string;
  repos_url:           string;
  events_url:          string;
  received_events_url: string;
  type:                string;
  site_admin:          boolean;
}

export interface PullRequest {
  url:       string;
  html_url:  string;
  diff_url:  string;
  patch_url: string;
  merged_at?: Date;
}