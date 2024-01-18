import { useEffect, useState } from 'react';

const useStatus = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('token'));
    const fetchStatus = async () => {
      if (token !== undefined) {
        try {
          const response = await fetch(`http://localhost:3000/user/status`, {
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

          if (responseData && responseData.error) {
            setResult(responseData);
          } else if (responseData && responseData.user) {
            console.log(responseData.user);
            setResult({
              user: responseData.user,
              profile: responseData.user.profile,
            });
          }
        } catch (error) {
          setServerError(error.message);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStatus();
  }, []);

  return { result, loading, serverError };
};

export default useStatus;
