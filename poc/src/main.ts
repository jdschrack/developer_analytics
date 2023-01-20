import fs from 'fs';
import EpicService from './JiraServices/EpicService';
import Epic from './JiraServices/Epic';
import { dateDiff, formatDate } from './Utilities/tools';
import dotenv from 'dotenv';
export default async function main(): Promise<void> {
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
        epic.originalDueDate = filteredHistory
          ? filteredHistory[0]?.to?.toISOString().split('T')[0]
          : undefined;
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
        } else if (item.status === 'In Progress') {
          group = 'In Progress';
        } else if (item.status === 'Blocked') {
          group = 'Blocked';
        }
        statusGroups.get(group)!.push(makeEpicHtml(item));
      });

      let output = '<html><style>' +
        'body {' +
        '  font-family: Arial, Helvetica, sans-serif;' +
        '}' +
        '</style><body>';
      for (const [status, html] of statusGroups) {
        output += `<h3>${status}</h3>`;
        output += html.join('');
      }
      output += '</body></html>';

      await fs.writeFileSync('output.html', output);
    }
  } catch (err) {
    console.error(err);
  }
}

function makeEpicHtml(epic: Epic): string {
  let difference = 0;
  if (epic.originalDueDate && epic.dueDate) {
    const originalDate = new Date(epic.originalDueDate);
    const newDate = new Date(epic.dueDate);
    difference = dateDiff(originalDate, newDate);
  }

  let statusText = `<li>Status: ${epic.status}</li>`;
  let endDateText = `<li>Current End Date: ${formatDate(epic.dueDate)}</li>`;
  if (epic.status !== 'Done' && epic.status !== 'Closed') {

    if (difference < 8) {
      statusText = `<li>Status: <span style="color: green; font-weight: bold">Green</span></li>`;
    }
    if (difference >= 8 && difference < 15) {
      statusText = `<li>Status: <span style="color: yellow; font-weight: bold">Yellow</span></li>`;
    } else if (difference >= 15) {
      statusText = `<li>Status: <span style="color: red; font-weight: bold">Red</span></li>`;
    }
  } else {
    endDateText = `<li>Completed Date: ${formatDate(epic.resolvedDate)}</li>`;
  }

  const output = `
<ul>
  <li>${epic.parentSummary}: <a href='https://banno-jha.atlassian.net/browse/${
    epic.parent
  }' target='_blank'>${epic.parent}</a>
    <ul>
      <li>${epic.summary}: <a href='https://banno-jha.atlassian.net/browse/${
    epic.key
  }' target='_blank'>${epic.key}</a>
        <ul>
          ${statusText}
          <li>Original End Date: ${formatDate(epic.originalDueDate)}</li>
          ${endDateText}
        </ul>
      </li>
    </ul>
  </li>
</ul>`;
  return output;
}
