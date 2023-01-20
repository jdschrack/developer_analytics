import axios, { AxiosInstance } from 'axios';

export default function JiraAxios(): AxiosInstance {
  const userName = process.env.JIRA_USERNAME;
  const password = process.env.JIRA_API_TOKEN;
  if (!password || !userName) {
    throw new Error('JIRA_USER_NAME and JIRA_API_TOKEN must be set');
  }
  const passwordBase64 = Buffer.from(`${userName}:${password}`).toString(
    'base64',
  );
  const axiosClient = axios.create({
    baseURL: process.env.JIRA_URL,
    headers: {
      Authorization: `Basic ${passwordBase64}`,
    },
  });
  return axiosClient;
}
