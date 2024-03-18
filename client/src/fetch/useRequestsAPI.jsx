import { useEffect, useState } from 'react';

const useReceivedRequests = () => {
  const [requests, setRequests] = useState(null);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(null);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('token'));
    const fetchFriends = async () => {
      if (token !== undefined) {
        try {
          const response = await fetch(
            `http://localhost:3000/user/friend/requests`,
            {
              mode: 'cors',
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (response.status >= 400) {
            throw new Error('server error');
          }
          const responseData = await response.json();

          if (responseData && responseData.error) {
            setRequests(responseData);
          } else if (responseData && responseData.requests) {
            console.log(responseData.requests);
            setRequests(responseData.requests);
          }
        } catch (error) {
          setRequestsError(error.message);
        } finally {
          setRequestsLoading(false);
        }
      }
    };
    fetchFriends();
  }, []);

  return { requests, requestsLoading, requestsError };
};

export default useReceivedRequests;
