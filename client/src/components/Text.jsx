import styles from './Text.module.css';

const Text = ({ message }) => {
  return (
    <div className={styles.Text}>
      <li key={message._id}>{message.text}</li>
    </div>
  );
};

export default Text;
