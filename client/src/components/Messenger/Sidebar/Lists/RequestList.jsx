import styles from './RequestList.module.css';
import { useEffect, useRef, useState } from 'react';
import useReceivedRequests from '../../../../fetch/useRequestsAPI';
import Request from './Request';

const RequestList = () => {
  const listRef = useRef();
  const { requests, requestsLoading, requestsError } = useReceivedRequests();
  const [renderList, setRenderList] = useState(null);
  const [isOverFlow, setIsOverFlow] = useState(null);

  useEffect(() => {
    if (requests && requests.length > 0) {
      setRenderList(true);
    }

    if (listRef.current?.scrollHeight > listRef.current?.clientHeight) {
      setIsOverFlow(true);
    }
  }, [requests]);

  if (requestsError) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (requestsLoading) {
    return (
      <div className={styles.loading} data-testid="loading">
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div
      className={isOverFlow ? styles.RequestListFlow : styles.RequestList}
      ref={listRef}
    >
      {renderList &&
        requests.map((request) => {
          return <Request key={request._id} profile={request} />;
        })}
    </div>
  );
};

export default RequestList;
