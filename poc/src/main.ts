import fs from 'fs';
import EpicService from './JiraServices/EpicService';
import Epic from './JiraServices/Epic';
import { formatDate } from './Utilities/tools';
import dotenv from 'dotenv';
import { RunType } from './types/RunType';
import _ from 'lodash';

function configureEnvironmentVariables(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const configResult = dotenv.config({
        path: '.env',
      });

      if (configResult.error) {
        reject(configResult.error);
      }

      resolve(undefined);
    } catch (ex) {
      reject(ex);
    }
  });
}

export default async function main(runType: RunType): Promise<void> {
  try {
    await configureEnvironmentVariables();
    const epics = await EpicService.getEpics();
    if (!epics) {
      throw new Error('No Epics Were Found with the Given Project!');
    }

    for (const epic of epics) {
      const endDateHistory = await EpicService.getEndDateHistory(epic.key);
      const filteredEndDateHistory = endDateHistory
        ?.filter((item) => item.from === undefined)
        .sort((a, b) => {
          if (a.to && b.to) {
            return a.to.getTime() - b.to.getTime();
          }
          return 0;
        });
      epic.dueDateHistory = filteredEndDateHistory;
      epic.originalDueDate = filteredEndDateHistory
        ? filteredEndDateHistory[0]?.to?.toISOString().split('T')[0]
        : undefined;
    }

    if (runType === RunType.EMAIL) {
      const email = makeEmail(epics, runType);
      fs.writeFileSync('output.html', email);
    } else if (runType === RunType.TRAFFIC) {
      const traffic = makeTraffic(epics, runType);
      fs.writeFileSync('traffic_report_output.html', traffic);
    }
  } catch (err) {
    console.error(err);
  }
}

function makeTraffic(epics: Array<Epic>, runType: RunType): string {
  if (runType !== RunType.TRAFFIC) {
    throw new Error('This function only works for traffic run type');
  }

  const grouped: string[] = _.chain(epics)
    .orderBy((epic: Epic) => [epic.parent, epic.key])
    .groupBy((epic: Epic) => {
      if (epic.parent) {
        return `<li><a href='https://banno-jha.atlassian.net/browse/${epic.parent}' target='_blank'>${epic.parent}</a>: ${epic.parentSummary}</li>`;
      } else {
        return `<li>Team Initiatives:</li>`;
      }
    })
    .map((epics: Array<Epic>, key: string) => {
      return `<ul>${key}${epics
        .map((epic: Epic) => {
          return makeEpicHtml(epic, runType);
        })
        .join('')}</ul>`;
    })
    .value();

  let output =
    '<html><style>' +
    'body {' +
    '  font-family: Arial, Helvetica, sans-serif;' +
    '}' +
    '</style><body>';
  output = `${output}${grouped.join('')}</body></html>`;

  return output;
}

function makeEmail(epics: Array<Epic>, runType: RunType): string {
  if (runType !== RunType.EMAIL) {
    throw new Error('This function only works for email run type');
  }

  const statusGroups: Map<string, Array<string>> = new Map([
    ['Done', []],
    ['Closed', []],
    ['Ready for Review', []],
    ['In Progress', []],
    ['Blocked', []],
    ['Planning', []],
  ]);

  epics.forEach((item: Epic) => {
    let group = 'Planning';
    if (item.status === 'Done') {
      group = 'Done';
    } else if (item.status === 'Closed') {
      group = 'Closed';
    } else if (item.status === 'Ready for Review') {
      group = 'Ready for Review';
    } else if (
      item.status === 'In Progress' ||
      item.status === 'Selected for Development'
    ) {
      group = 'In Progress';
    } else if (item.status === 'Blocked') {
      group = 'Blocked';
    }
    statusGroups.get(group)?.push(makeEpicHtml(item, runType));
  });

  let output =
    '<html><style>' +
    'body {' +
    '  font-family: Arial, Helvetica, sans-serif;' +
    '}' +
    '</style><body>';
  for (const [status, html] of statusGroups) {
    output += `<h3>${status}</h3>`;
    output += html.join('');
  }
  output += '</body></html>';

  return output;
}

function makeEpicHtml(epic: Epic, runType: RunType): string {
  let dueDates = _.orderBy(epic.dueDateHistory, 'to').map((x) =>
    formatDate(x.to),
  );

  if (dueDates.indexOf(formatDate(epic.dueDate)) === -1) {
    dueDates = [...dueDates, formatDate(epic.dueDate)];
  }

  const statusText = `<li>Status: ${epic.status}</li>`;
  let endDateText = `<li>End Date: ${dueDates?.join(', ') || 'TBD'}</li>`;
  if (epic.status === 'Done' || epic.status === 'Closed') {
    endDateText = `<li>End Date: ${dueDates?.join(', ') || 'TBD'}</li>
      <li>Completd On: ${formatDate(epic.resolvedDate)}</li>`;
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
      <li>${epic.summary}: <a href='https://banno-jha.atlassian.net/browse/${epic.key}' target='_blank'>${epic.key}</a></li>
        <ul>
          ${statusText}
          ${endDateText}
        </ul>
    </ul>`;
  }
}
