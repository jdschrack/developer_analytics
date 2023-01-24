import axios, { AxiosError } from 'axios';
import JiraAxios from '../Utilities/JiraAxios';
import Epic, { EpicDueDateHistory } from './Epic';
import { URLSearchParams } from 'url';

export default class EpicService {
  static async getEpics(): Promise<Epic[] | undefined> {
    try {
      const jiraAxios = JiraAxios();
      let morePages = true;
      let offsetCounter = 0;
      const epics: Set<Epic> = new Set<Epic>();
      const project = process.env.JIRA_PROJECT || 'PUP';
      //const jql = `project = ${project} and issuetype = Epic and updated >= "-90d" and "Effort type[Select List (multiple choices)]" not in ("Internal / Team(s)") ORDER BY updated DESC`;
      const jql = `project = ${project} and issuetype = Epic and Labels = traffic-report order by status DESC`
      while (morePages) {
        const params = new URLSearchParams({
          jql: jql,
          maxResults: '100',
          startAt: offsetCounter.toString(),
          expand: 'fields',
          fields: 'duedate,summary,status,parent,resolutiondate',
        });
        const response = await jiraAxios.get(`/rest/api/3/search?${params}`);
        const { total, issues } = response.data;

        offsetCounter += 100;
        console.log(
          `Getting epics from Jira. Offset: ${offsetCounter} / ${total}`,
        );

        console.log(JSON.stringify(issues[0], null, 2));

        for (const issue of issues) {
          epics.add({
            key: issue.key,
            parent: issue.fields.parent?.key,
            parentSummary: issue.fields.parent?.fields.summary,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            resolvedDate: issue.fields.resolutiondate,
            dueDate: issue.fields.duedate,
          } as Epic);
        }

        if (offsetCounter >= total) {
          morePages = false;
        }
      }
      return Array.from(epics);
    } catch (err: AxiosError | Error | unknown) {
      if (axios.isAxiosError(err)) {
        console.error(err.response);
      } else {
        console.error(err);
      }
    }
  }

  static async getEndDateHistory(
    issueIdOrKey: string,
  ): Promise<Array<EpicDueDateHistory> | undefined> {
    try {
      console.log(`Getting end date history for ${issueIdOrKey}`);
      const jiraAxios = JiraAxios();
      const dueDateHistory: Set<EpicDueDateHistory> =
        new Set<EpicDueDateHistory>();
      let repeat = true;
      let itemOffset = 0;
      while (repeat) {
        const response = await jiraAxios.get(
          `/rest/api/3/issue/${issueIdOrKey}/changelog?maxResults=100&startAt=${itemOffset}`,
        );
        const result = response.data;
        for (const history of result.values) {
          for (const item of history.items) {
            if (item.field === 'duedate') {
              dueDateHistory.add({
                from: item.from ? new Date(item.from) : undefined,
                to: item.to ? new Date(item.to) : undefined,
              });
            }
          }
        }

        if (result.nextPage === undefined) {
          repeat = false;
        } else {
          itemOffset += 100;
        }
      }

      return Array.from(dueDateHistory);
    } catch (err) {
      console.error(err);
    }
  }
}
