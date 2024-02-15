import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import * as useStatus from '../fetch/StatusAPI';
import * as LoginFetch from '../fetch/LoginAPI';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

const useStatusSpy = vi.spyOn(useStatus, 'default');
const LoginFetchSpy = vi.spyOn(LoginFetch, 'default');

describe('from useStatus result', () => {
  test('should render error page', async () => {
    useStatusSpy.mockReturnValue({
      result: null,
      loading: false,
      serverError: true,
    });

    render(<Login />);

    const errorDiv = screen.getByTestId('error');

    expect(errorDiv).toBeInTheDocument();
  });

  test('should render loading page', () => {
    useStatusSpy.mockReturnValue({
      result: null,
      loading: true,
      serverError: null,
    });

    render(<Login />);

    const loadingDiv = screen.getByTestId('loading');

    expect(loadingDiv).toBeInTheDocument();
  });

  test('should render login page', () => {
    useStatusSpy.mockReturnValue({
      result: { error: 'token error message' },
      loading: false,
      serverError: null,
    });

    render(<Login />);

    const login = screen.getByRole('button', { name: /log in/i });

    expect(login).toBeInTheDocument();
  });
});

describe('login form', () => {
  test('should show error message', async () => {
    const user = userEvent.setup();

    useStatusSpy.mockReturnValue({
      result: { error: 'token error message' },
      loading: false,
      serverError: null,
    });

    LoginFetchSpy.mockReturnValue({
      formErrors: [{ msg: 'email error' }, { msg: 'password error' }],
    });

    render(<Login />);

    const button = screen.getAllByRole('button');
    const login = button[0];

    await user.click(login);

    const email = await screen.findByTestId('email');
    const password = await screen.findByTestId('password');

    expect(email.textContent).toMatch(/email error/i);
    expect(password.textContent).toMatch(/password error/i);
  });
});

describe('singup button', () => {
  test('should navigate to singup page', async () => {
    const user = userEvent.setup();

    useStatusSpy.mockReturnValue({
      result: { error: 'token error message' },
      loading: false,
      serverError: null,
    });

    render(<Login />);

    const signup = screen.getByRole('button', { name: /sign up/i });

    await user.click(signup);

    const LoginDiv = screen.getByText(/redirected/i);

    expect(LoginDiv.childNodes[1].textContent).toMatch(
      /Redirected to \/signup/i,
    );
  });
});
