import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import * as useStatus from '../fetch/messenger/StatusAPI';
import * as LoginFetch from '../fetch/messenger/LoginAPI';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

const useStatusSpy = vi.spyOn(useStatus, 'default');
const LoginFetchSpy = vi.spyOn(LoginFetch, 'default');
vi.spyOn(Storage.prototype, 'setItem');

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
  test('should show form error message', async () => {
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

    expect(email.childNodes[0].className).toMatch(/inputoutline/i);
    expect(password.childNodes[0].className).toMatch(/inputoutline/i);
    expect(email.textContent).toMatch(/email error/i);
    expect(password.textContent).toMatch(/password error/i);
  });

  test('should show form loading', async () => {
    const user = userEvent.setup();

    useStatusSpy.mockReturnValue({
      result: { error: 'token error message' },
      loading: false,
      serverError: null,
    });

    LoginFetchSpy.mockReturnValue({});

    render(<Login />);

    const button = screen.getAllByRole('button');
    const login = button[0];
    await user.click(login);

    const loading = await screen.findByTestId('loading');
    expect(loading).toBeInTheDocument();
  });

  test('should show user input values', async () => {
    const user = userEvent.setup();

    useStatusSpy.mockReturnValue({
      result: { error: 'token error message' },
      loading: false,
      serverError: null,
    });

    render(<Login />);

    const email = screen.getByTestId('email');
    const password = screen.getByTestId('password');

    await user.type(email.childNodes[0], 'foo@foobar.com');
    await user.type(password.childNodes[0], 'password123');

    const emailValue = await screen.findByTestId('email');
    const passwordValue = await screen.findByTestId('password');

    expect(emailValue.childNodes[0].value).toMatch(/foo@foobar.com/i);
    expect(passwordValue.childNodes[0].value).toMatch(/password123/i);
  });

  test('should render error page for login server error ', async () => {
    const user = userEvent.setup();

    useStatusSpy.mockReturnValue({
      result: { error: 'token error message' },
      loading: false,
      serverError: null,
    });

    LoginFetchSpy.mockReturnValue({
      error: { msg: 'server error' },
    });

    render(<Login />);

    const button = screen.getAllByRole('button');
    await user.click(button[0]);

    const errorDiv = screen.getByTestId('error');

    expect(errorDiv).toBeInTheDocument();
  });

  test('should respond with token and redirect', async () => {
    const user = userEvent.setup();

    useStatusSpy.mockReturnValue({
      result: { error: 'token error message' },
      loading: false,
      serverError: null,
    });

    LoginFetchSpy.mockReturnValue({
      token: 'token123!@#',
    });

    render(<Login />);

    const button = screen.getAllByRole('button');
    await user.click(button[0]);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'token',
      JSON.stringify('token123!@#'),
    );

    const LoginDiv = screen.getByText(/redirected/i);

    expect(LoginDiv.childNodes[1].textContent).toMatch(/Redirected to \//i);
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
