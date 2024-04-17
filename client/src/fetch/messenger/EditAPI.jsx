const EditFetch = async (editPayload) => {
  const token = JSON.parse(localStorage.getItem('token'));
  try {
    const response = await fetch(`http://localhost:3000/user/profile/edit`, {
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editPayload),
    });

    if (response.status >= 400) {
      throw new Error('server error');
    }

    const responseData = await response.json();

    if (responseData && responseData.errors) {
      return { formErrors: responseData.errors };
    }

    if (responseData && responseData.error) {
      return { error: responseData.error };
    }

    if (responseData && responseData.updatedProfile) {
      console.log(responseData);
      return { responseData };
    }
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export default EditFetch;
