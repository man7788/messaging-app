const SignUpFetch = (
  signUpPayload,
  setFormErrors,
  setServerError,
  setLoading,
) => {
  console.log(signUpPayload);
  fetch(`http://localhost:3000/signup`, {
    mode: 'cors',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(signUpPayload),
  })
    .then((response) => {
      if (response.status >= 400) {
        throw new Error('server error');
      }
      return response.json();
    })
    .then((response) => {
      if (response && response.errors) {
        setFormErrors(response.errors);
        throw new Error('sign up error');
      }
      console.log(response);
    })
    .catch((error) => {
      if (error && error.message == 'sever error') {
        setServerError(error);
      }
      console.error(error);
    })
    .finally(() => setLoading(false));
};

export default SignUpFetch;
