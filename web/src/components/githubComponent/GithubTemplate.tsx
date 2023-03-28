import './GithubStyle.css';
import Users from '../Users';
import React from 'react';
import { GitTeam } from '../../types/GitTeam';

interface GithubProps {
  setSearchText: (searchText: string) => void;
  searchText: string;
  filteredTeams: GitTeam[];
  setTeam: (team: GitTeam) => void;
  team: GitTeam;
}

function GithubTemplate(props: GithubProps) {
  const { setSearchText, searchText, filteredTeams, setTeam, team } = props;
  return (
    <div className={'page'}>
      <div className={'navcontainer'}>
        <div className={'searchform'}>
          <label htmlFor='teamSearch'>Search Teams</label>
          <input name={'teamSearch'} type={'text'} value={searchText} onChange={e => setSearchText(e.target.value)} />
        </div>
        <div className={'team-list'}>
          {filteredTeams.map((team) => {
            return (
              <div onClick={() => {
                setTeam(team);
              }} key={team.id} className={'team-item'}>
                <p style={{
                  padding: '0px',
                  margin: `0`,
                  fontWeight: '600',
                }}>{team.name}</p>
                <p style={{
                  padding: '0px',
                  margin: `0`,
                  fontSize: '.8rem',
                }}>{team.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <Users teamSlug={team.slug} />
      </div>
    </div>
  );
}

export default GithubTemplate;