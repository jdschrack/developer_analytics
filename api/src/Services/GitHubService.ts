import { Octokit } from 'octokit';
import Team from '../Models/Team';
import TeamMember from '../Models/TeamMember';
import PullRequest from '../Models/PullRequest';
import { PullMetrics, PullMetricStats } from '../Models/PullMetrics';
import _ from 'lodash';
import { PullResult } from '../Models/GitPullResult';
import GitUser from '../Models/GitUser';

export class GitHubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  public async getTeams(): Promise<Team[]> {
    let page = 1;
    let nextPage = true;
    const teamSet: Set<Team> = new Set<Team>();
    while (nextPage) {
      const teams = await this.octokit.request('GET /orgs/{org}/teams?page={page}&per_page={take}', {
        org: 'banno', page, take: 100,
      });

      if (teams.data.length === 0) {
        nextPage = false;
      }

      for (const team of teams.data) {
        teamSet.add({
          id: team.id,
          name: team.name,
          description: team.description,
          slug: team.slug,
        });
      }

      page += 1;
    }

    return Array.from(teamSet);
  }

  public async getTeamMembers(slug: string): Promise<TeamMember[]> {
    let page = 1;
    let nextPage = true;
    const memberSet: Set<TeamMember> = new Set<TeamMember>();
    while (nextPage) {
      const members = await this.octokit.request('GET /orgs/{org}/teams/{team_slug}/members?page={page}&per_page={take}', {
        org: 'banno', team_slug: slug, page: page, take: 100,
      });

      console.log(members.data.length);
      if (members.data.length === 0) {
        nextPage = false;
        break;
      }

      for (const member of members.data) {
        const userDetails = await this.getUserDetails(member.login);
        memberSet.add({
          id: userDetails.id, login: userDetails.login, name: userDetails.name, email: userDetails.email, avatar_url: userDetails.avatar_url,
        });
      }

      page += 1;
    }

    return Array.from(memberSet);
  }

  public async getUserDetails(userName: string): Promise<GitUser> {
    const user = await this.octokit.request('GET /users/{userName}', {
      userName,
    });

    return user.data;
  }

  public async getPullStats(userName: string): Promise<PullMetricStats[]> {
    let page = 1;
    let nextPage = true;
    const pullSet: Array<PullRequest> = new Array<PullRequest>();
    const baseDate = new Date();
    const startDate = new Date(baseDate.setDate(baseDate.getDate() - 365)).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    while (nextPage) {
      const pulls = await this.octokit.request('GET /search/issues?q=author:{userName}+is:pr+user:{org}+created:{dateRange}&page={page}&per_page={take}', {
        userName, dateRange: `${startDate}..${endDate}`, page, org: 'banno', take: 100,
      });

      if (pulls.data.items.length === 0) {
        nextPage = false;
      }

      pulls.data.items.forEach((pull: PullResult) => {
        pullSet.push({
          id: pull.id,
          title: pull.title,
          url: pull.pull_request?.html_url ?? '',
          state: pull.state,
          created_at: pull.created_at,
          updated_at: pull.updated_at,
          closed_at: pull.closed_at,
          merged_at: pull.pull_request?.merged_at ?? undefined,
        });
      });

      page += 1;
    }

    const orderedPulls = _.sortBy(pullSet, 'created_at');

    const groupedPulls = orderedPulls.reduce((acc: PullMetrics, pullRequest) => {
      const month = new Date(pullRequest.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        timeZone: 'UTC',
      });
      const key = `${month}`;
      let status = pullRequest.state;

      if (pullRequest.merged_at) {
        status = 'merged';
      }

      if (!acc[key]) {
        acc[key] = {};
      }
      if (!acc[key][status]) {
        acc[key][status] = [];
      }
      acc[key][status].push(pullRequest);

      return acc;
    }, {});

    const pullMetrics: PullMetricStats[] = [] as PullMetricStats[];
    Object.keys(groupedPulls).forEach((month) => {
      pullMetrics.push({
        date: new Date(month),
        open: groupedPulls[month].open?.length ?? 0,
        closed: groupedPulls[month].closed?.length ?? 0,
        merged: groupedPulls[month].merged?.length ?? 0,
      });

    });

    return pullMetrics;
  }
}