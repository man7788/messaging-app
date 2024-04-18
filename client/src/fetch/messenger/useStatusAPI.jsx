import { useEffect, useState } from 'react';

const useStatus = () => {
  const [statusResult, setStatusResult] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState(null);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('token'));
    const fetchStatus = async () => {
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

        console.log(responseData);
        setStatusResult(responseData);
      } catch (error) {
        setStatusError(error.message);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatus();
  }, []);

  return { statusResult, statusLoading, statusError };
};

export default useStatus;
