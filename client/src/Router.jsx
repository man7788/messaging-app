import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import ErrorPage from './ErrorPage';
import Login from './components/login';
import SignUp from './components/Signup';
import Messenger from './components/messenger';
import Edit from './components/Edit';
import Password from './components/Password';

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
      path: '/chat',
      element: <Messenger />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/profile/edit',
      element: <Edit />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/password/edit',
      element: <Password />,
      errorElement: <ErrorPage />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
