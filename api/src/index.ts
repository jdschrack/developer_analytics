import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import dotenv from 'dotenv';
import * as repl from 'repl';
import { GitHubService } from './Services/GitHubService';
import _ from 'lodash';
import ApplicationResponse from './Models/ApplicationResponse';
import Team from './Models/Team';
import TeamMember from './Models/TeamMember';
import { PullMetrics, PullMetricStats } from './Models/PullMetrics';

dotenv.config();

const app: FastifyInstance = fastify({ logger: true });

app.get('/git/teams', async (request, reply) => {
  const response: ApplicationResponse<Team[]> = {
    data: [] as Team[],
    itemCount: 0,
  } as ApplicationResponse<Team[]>;
  try {
    const githubService = new GitHubService();
    const teams = await githubService.getTeams();
    response.data = _.sortBy(teams, (t) => { return t.name });
    response.itemCount = response.data.length;
    reply.code(200).send(response).headers({ 'Content-Type': 'application/json' });
  } catch (err) {
    app.log.error(err);
    reply.send(err).code(500);
  }
});

app.get('/git/users/:teamSlug', async (request: FastifyRequest<{Params: {teamSlug: string | undefined}}>, reply) => {
  if (request.params.teamSlug === undefined) {
    reply.code(400).send({ error: 'Missing team slug' });
    return;
  }
  const response: ApplicationResponse<TeamMember[]> = {} as ApplicationResponse<TeamMember[]>;
  try {
    const githubService = new GitHubService();
    const teamMembers = await githubService.getTeamMembers(request.params.teamSlug);
    app.log.info(`Found ${teamMembers.length} team members`);
    response.data = _.sortBy(teamMembers, (t) => { return t.name });
    response.itemCount = response.data.length;
    reply.code(200).send(response).headers({ 'Content-Type': 'application/json' });
  } catch (ex) {
    app.log.error(ex);
    reply.send(ex).code(500);
  }
});

app.get('/git/pull-stats/:userName', async (request: FastifyRequest<{
  Params: { userName: string | undefined };
}>, reply) => {
  const { userName } = request.params;
  if (userName === undefined) {
    reply.code(400).send({ error: 'Missing user name' });
    return;
  }
  const response: ApplicationResponse<PullMetricStats[]> = {} as ApplicationResponse<PullMetricStats[]>;
  try {
    const githubService = new GitHubService();
    const pullStats = await githubService.getPullStats(userName);
    response.data = pullStats;
    response.itemCount = pullStats.length;
    reply.code(200).send(response).headers({ 'Content-Type': 'application/json' });
  } catch (ex) {
    app.log.error(ex);
    reply.send(ex).code(500);
  }
});

const start = async () => {
  try {
    await app.listen({ port: 3001 });
    app.log.info('🚀 Server started and listing 🎉');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();