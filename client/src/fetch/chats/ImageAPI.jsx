const ImageFetch = async (sendPayload) => {
  const newForm = new FormData();

  newForm.append('user_id', sendPayload.user_id);
  newForm.append('msgImage', sendPayload.image);

  const token = JSON.parse(localStorage.getItem('token'));
  try {
    const response = await fetch(`http://localhost:3000/chat/send/image`, {
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

    if (responseData && responseData.errors) {
      return { formErrors: responseData.errors };
    }
    console.log(responseData);
    return { responseData };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export default ImageFetch;
