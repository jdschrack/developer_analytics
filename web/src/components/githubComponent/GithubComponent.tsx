import React, { useEffect, useLayoutEffect } from 'react';
import { GitTeam } from '../../types/GitTeam';
import GitService from '../../services/GitService';
import GithubTemplate from './GithubTemplate';

function GithubComponent() {
  const [teams, setTeams] = React.useState<GitTeam[]>([] as GitTeam[]);
  const [team, setTeam] = React.useState<GitTeam>({} as GitTeam);
  const [filteredTeams, setFilteredTeams] = React.useState<GitTeam[]>([] as GitTeam[]);
  const [searchText, setSearchText] = React.useState<string>('');
  useEffect(() => {
    const gitService = new GitService();
    gitService.getGitTeams().then((teams) => {
      console.log(JSON.stringify(teams));
      const sortedTeams = teams.data.sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return -1;
        }
        if (a.name.toLowerCase() > b.name.toLowerCase()) {
          return 1;
        }
        return 0;
      });
      setTeams(sortedTeams ?? [] as GitTeam[]);
      setFilteredTeams(sortedTeams ?? [] as GitTeam[]);
    }).catch((error) => {
      console.log(error);
    });
  }, []);

  useLayoutEffect(() => {
    handleTeamSearch(searchText);
  }, [searchText]);

  const handleTeamSearch = (teamSearch: string | undefined) => {
    if (teamSearch) {
      const filteredTeams = teams.filter((team) => {
        return team.name.toLowerCase().includes(teamSearch.toLowerCase());
      });
      setFilteredTeams(filteredTeams);
    }
  };

  return (
    <GithubTemplate setSearchText={setSearchText} searchText={searchText} filteredTeams={filteredTeams}
                    setTeam={setTeam} team={team} />
  );
}

export default GithubComponent;