import styles from './ErrorPage.module.css';

const ErrorPage = () => {
  return (
    <div className={styles.error}>
      <h1>A network error was encountered</h1>
    </div>
  );
};

export default ErrorPage;
