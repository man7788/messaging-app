import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from './SignUp';
import * as SignUpFetch from '../fetch/SignUpAPI';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

const SignUpFetchSpy = vi.spyOn(SignUpFetch, 'default');

describe('signup form', () => {
  test('should render error page', async () => {
    const user = userEvent.setup();

    SignUpFetchSpy.mockReturnValueOnce({
      error: 'server error',
    });

    render(<SignUp />);

    const button = screen.getAllByRole('button');

    await user.click(button[0]);

    const errorDiv = screen.getByTestId('error');

    expect(errorDiv).toBeInTheDocument();
  });

  test('should render loading container', async () => {
    const user = userEvent.setup();

    SignUpFetchSpy.mockReturnValueOnce(null);

    render(<SignUp />);

    const button = screen.getAllByRole('button');

    await user.click(button[0]);

    const loadingDiv = screen.getByTestId('loading');

    expect(loadingDiv).toBeInTheDocument();
  });
});

describe('cancel button', () => {
  test('should navigate to login page', async () => {
    const user = userEvent.setup();

    render(<SignUp />);

    const cancel = screen.getByRole('button', { name: /cancel/i });

    await user.click(cancel);

    const SignUpDiv = screen.getByText(/redirected/i);

    expect(SignUpDiv.childNodes[1].textContent).toMatch(
      /Redirected to \/login/i,
    );
  });
});
