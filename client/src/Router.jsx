import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import ErrorPage from './ErrorPage';
import Login from './components/login';
import SignUp from './components/Signup';
import Messenger from './components/messenger';

const Router = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <App />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/login',
      element: <Login />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/signup',
      element: <SignUp />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/user/:id',
      element: <Messenger />,
      errorElement: <ErrorPage />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
