const LoginFetch = (
  loginPayload,
  setFormErrors,
  setServerError,
  setLoading
) => {
  fetch(`http://localhost:3000/login`, {
    mode: "cors",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginPayload),
  })
    .then((response) => {
      console.log(response);
      if (response.status >= 400) {
        throw new Error("server error");
      }
      return response.json();
    })
    .then((response) => {
      if (response && response.errors) {
        setFormErrors(response.errors);
        throw new Error("login error");
      }
      console.log("Success:", response);
      localStorage.setItem("token", JSON.stringify(response.token));
    })
    .catch((error) => {
      if (error && error.message == "sever error") {
        setServerError(error);
      }

      console.dir(error);
      console.error(error);
    })
    .finally(() => setLoading(false));
};

export { LoginFetch };
