const MessagesFetch = async (idPayload) => {
  const token = JSON.parse(localStorage.getItem('token'));
  try {
    const response = await fetch(`http://localhost:3000/chat/messages`, {
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(idPayload),
    });
    if (response.status >= 400) {
      throw new Error('server error');
    }
    const responseData = await response.json();

    if (responseData && responseData.error) {
      return { error: responseData.error };
    }

    console.log(responseData);
    return { responseData };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export default MessagesFetch;
