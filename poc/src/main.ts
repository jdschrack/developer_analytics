import fs from 'fs';
import EpicService from './JiraServices/EpicService';
import Epic from './JiraServices/Epic';
import { dateDiff, formatDate } from './Utilities/tools';
import dotenv from 'dotenv';
import { RunType } from './types/RunType';
import { run } from 'node:test';
import _ from 'lodash';

export default async function main(runType: RunType): Promise<void> {
  try {
    const configResult = dotenv.config({
      path: '.env',
    });
    if (configResult.error) {
      throw configResult.error;
    }
  } catch (err) {
    console.error(err);
  }

  try {
    const epics = await EpicService.getEpics();
    if (epics) {
      for (const epic of epics) {
        const history = await EpicService.getEndDateHistory(epic.key);
        const filteredHistory = history
          ?.filter((item) => item.from === undefined)
          .sort((a, b) => {
            if (a.to && b.to) {
              return a.to.getTime() - b.to.getTime();
            }
            return 0;
          });
        epic.dueDateHistory = filteredHistory;
        epic.originalDueDate = filteredHistory ? filteredHistory[0]?.to?.toISOString().split('T')[0] : undefined;
      }

      if (runType === RunType.EMAIL) {
        const email = makeEmail(epics, runType);
        fs.writeFileSync('output.html', email);
      } else if (runType === RunType.TRAFFIC) {
        const traffic = makeTraffic(epics, runType);
        fs.writeFileSync('traffic_report_output.html', traffic);
        //console.log(traffic);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function makeTraffic(epics: Array<Epic>, runType: RunType): string {
  if (runType !== RunType.TRAFFIC) {
    throw new Error('This function only works for traffic run type');
  }

  const grouped: string[] = _.chain(epics).orderBy((epic: Epic) => [epic.parent, epic.key]).groupBy((epic: Epic) => {
    if (epic.parent) {
      return `<li>${epic.parentSummary}: <a href='https://banno-jha.atlassian.net/browse/${epic.parent}' target='_blank'>${epic.parent}</a>`;
    } else {
      return `<li>Team Initiatives:</li>`;
    }
  }).map((epics: Array<Epic>, key: string) => {
    return `<ul>${key}${epics.map((epic: Epic) => {
      return makeEpicHtml(epic, runType);
    }).join('')}</ul>`;
  }).value();

  let output = '<html><style>' + 'body {' + '  font-family: Arial, Helvetica, sans-serif;' + '}' + '</style><body>';
  output = `${output}${grouped.join('')}</body></html>`;

  return output;

}

function makeEmail(epics: Array<Epic>, runType: RunType): string {
  if (runType !== RunType.EMAIL) {
    throw new Error('This function only works for email run type');
  }

  const statusGroups: Map<string, Array<string>> = new Map([['Done', []], ['Closed', []], ['Ready for Review', []], ['In Progress', []], ['Blocked', []], ['Planning', []]]);

  epics.forEach((item: Epic) => {
    let group = 'Planning';
    if (item.status === 'Done') {
      group = 'Done';
    } else if (item.status === 'Closed') {
      group = 'Closed';
    } else if (item.status === 'Ready for Review') {
      group = 'Ready for Review';
    } else if (item.status === 'In Progress' || item.status === 'Selected for Development') {
      group = 'In Progress';
    } else if (item.status === 'Blocked') {
      group = 'Blocked';
    }
    statusGroups.get(group)?.push(makeEpicHtml(item, runType));
  });

  let output = '<html><style>' + 'body {' + '  font-family: Arial, Helvetica, sans-serif;' + '}' + '</style><body>';
  for (const [status, html] of statusGroups) {
    output += `<h3>${status}</h3>`;
    output += html.join('');
  }
  output += '</body></html>';

  return output;
}

function makeEpicHtml(epic: Epic, runType: RunType): string {
  let difference = 0;
  if (epic.originalDueDate && epic.dueDate) {
    const originalDate = new Date(epic.originalDueDate);
    const newDate = new Date(epic.dueDate);
    difference = dateDiff(originalDate, newDate);
  }

  const statusText = `<li>Status: ${epic.status}</li>`;
  let endDateText = `<li>Current End Date: ${formatDate(epic.dueDate)}</li>`;
  if (epic.status === 'Done' || epic.status === 'Closed') {
    endDateText = `<li>End Date: ${formatDate(epic.dueDate)}</li>
      <li>Completd On:${formatDate(epic.resolvedDate)}</li>`;
  }



  if (runType === RunType.EMAIL) {
    return `
    <ul>
      <li>${epic.summary}: <a href='https://banno-jha.atlassian.net/browse/${epic.key}' target='_blank'>${epic.key}</a></li>
    </ul>
    `;
  } else {
    return `
    <ul>
      <li>${epic.summary}: <a href='https://banno-jha.atlassian.net/browse/${epic.key}' target='_blank'>${epic.key}</a>
        <ul>
          ${statusText}
          <li>Original End Date: ${formatDate(epic.originalDueDate)}</li>
          ${endDateText}
        </ul>
      </li>
    </ul>`;
  }
}
