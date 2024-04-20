const GroupSendImageFetch = async (sendPayload) => {
  const newForm = new FormData();

  newForm.append('group_id', sendPayload.group_id);
  newForm.append('msgImage', sendPayload.image);

  const token = JSON.parse(localStorage.getItem('token'));
  try {
    const response = await fetch(`http://localhost:3000/group/send/image`, {
      mode: 'cors',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: newForm,
    });

    if (response.status >= 400) {
      throw new Error('server error');
    }

    const responseData = await response.json();

    return { responseData };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export default GroupSendImageFetch;
