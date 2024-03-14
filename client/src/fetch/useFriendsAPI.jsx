import { useEffect, useState } from 'react';

const useFriends = () => {
  const [friends, setFriends] = useState(null);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendssError, setFriendsError] = useState(null);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('token'));
    const fetchFriends = async () => {
      if (token !== undefined) {
        try {
          const response = await fetch(`http://localhost:3000/user/friends`, {
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
            setFriends(responseData);
          } else if (responseData && responseData.friendList) {
            console.log(responseData.friendList);
            setFriends(responseData.friendList);
          }
        } catch (error) {
          setFriendsError(error.message);
        } finally {
          setFriendsLoading(false);
        }
      }
    };
    fetchFriends();
  }, []);

  return { friends, friendsLoading, friendssError };
};

export default useFriends;
