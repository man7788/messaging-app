import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import * as useStatus from '../fetch/StatusAPI';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

const useStatusSpy = vi.spyOn(useStatus, 'default');

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
