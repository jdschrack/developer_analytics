import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { GitTeam } from './types/GitTeam';
import GitService from './services/GitService';
import Users from './components/Users';

function App() {
  const [teams, setTeams] = React.useState<GitTeam[]>([] as GitTeam[]);
  const [team, setTeam] = React.useState<GitTeam>({} as GitTeam);
  useEffect(() => {
    const gitService = new GitService();
    gitService.getGitTeams().then((teams) => {
      console.log(JSON.stringify(teams));
      setTeams(teams.data ?? [] as GitTeam[]);
    }).catch((error) => {
      console.log(error);
    });
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden',
      height: '100vh',
      widows: '100vw',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid black',
        overflow: 'auto',
      }}>
      {teams.map((team) => {
        return (
          <div onClick={() => {
            setTeam(team);
          }} key={team.id} style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '.24rem',
            borderBottom: '1px solid #ccc',
            marginRight: `.1rem`
          }}>
            <p style={{
              padding: '0px',
              margin: `0`,
              fontWeight: '600'}}>{team.name}</p>
            <p style={{
              padding: '0px',
              margin: `0`,
              fontSize: '.8rem',
            }}>{team.description}</p>
            </div>
        );
      })}
        </div>
      <div>
        <Users teamSlug={team.slug} />
      </div>
    </div>
  );
}

export default App;
