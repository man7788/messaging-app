import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import ErrorPage from './ErrorPage';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Messenger from './components/Messenger/Messenger';

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
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
