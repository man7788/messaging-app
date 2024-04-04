const SignUpFetch = async (signUpPayload) => {
  try {
    const response = await fetch(`http://localhost:3000/signup`, {
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signUpPayload),
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

export default SignUpFetch;
