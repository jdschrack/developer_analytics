import BaseService from './BaseService';
import { GitUser } from '../types/GitUser';
import { GitTeam } from '../types/GitTeam';
import { ApiResponse } from '../types/ApiResponse';

export default class GitService extends BaseService {
  constructor() {
    super();
  }

  public async getGitUsers(teamSlug: string): Promise<ApiResponse<GitUser[]>> {
    const response = await this.get<ApiResponse<GitUser[]>>(`/git/users/${teamSlug}`);
    return (response).data;
  }

  public async getGitTeams(): Promise<ApiResponse<GitTeam[]>> {
    const response = await this.get<ApiResponse<GitTeam[]>>('/git/teams');
    return (response).data;
  }
}