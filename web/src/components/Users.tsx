import { FC, PropsWithChildren, useEffect, useState } from 'react';
import GitService from '../services/GitService';
import { GitUser } from '../types/GitUser';

interface UserProps {
  teamSlug?: string,
}

const Users: FC<PropsWithChildren<UserProps>> = ({ teamSlug }) => {
  const gitService = new GitService();
  const [users, setUsers] = useState<GitUser[]>([] as GitUser[]);
  useEffect(() => {
    if (teamSlug) {
      gitService.getGitUsers(teamSlug).then((users) => {
        setUsers(users.data);
      });
    }
  }, [teamSlug]);
  if (teamSlug === undefined) {
    return <></>;
  }
  return (
    <ul>
      {users.map((user) => (
        <div key={user.id} style={{
          display: 'flex',
          flexDirection: 'row',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <img src={user.avatar_url} alt={user.login} style={{
            width: '2rem',
            height: '2rem',
          }
          } /></div>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '.24rem',
            }}><p>{user.name} ({user.login})</p></div>
        </div>
      ))}
    </ul>
  );
};

export default Users;