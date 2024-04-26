import { useEffect, useState } from 'react';

const useProfiles = () => {
  const [profiles, setProfiles] = useState(null);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState(null);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('token'));
    const fetchProfiles = async () => {
      if (token !== undefined) {
        try {
          const response = await fetch(`http://localhost:3000/user/profiles`, {
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

          console.log(responseData.profiles);
          setProfiles(responseData.profiles);
        } catch (error) {
          setProfilesError(error.message);
        } finally {
          setProfilesLoading(false);
        }
      }
    };
    fetchProfiles();
  }, []);

  return { profiles, profilesLoading, profilesError };
};

export default useProfiles;
