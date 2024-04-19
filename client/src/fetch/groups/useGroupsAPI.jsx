import { useEffect, useState } from 'react';

const useGroups = () => {
  const [groups, setGroups] = useState(null);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState(null);
  const [updateGroups, setUpdateGroups] = useState(null);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('token'));
    const fetchGroups = async () => {
      if (token !== undefined) {
        try {
          const response = await fetch(`http://localhost:3000/group/all`, {
            mode: 'cors',
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status >= 400) {
            throw new Error('server error');
          }
          const responseData = await response.json();

          console.log(responseData.groups);
          setGroups(responseData.groups);
        } catch (error) {
          setGroupsError(error.message);
        } finally {
          setGroupsLoading(false);
        }
      }
    };
    fetchGroups();
  }, [updateGroups]);

  return {
    groups,
    groupsLoading,
    groupsError,
    updateGroups,
    setUpdateGroups,
  };
};

export default useGroups;
