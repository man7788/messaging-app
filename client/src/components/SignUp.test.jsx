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

  test('should show user input values', async () => {
    const user = userEvent.setup();

    render(<SignUp />);

    const email = screen.getByTestId('email');
    const fullName = screen.getByTestId('full_name');
    const password = screen.getByTestId('password');
    const confirmPassword = screen.getByTestId('confirm_password');

    await user.type(email.childNodes[0], 'foo@foobar.com');
    await user.type(fullName.childNodes[0], 'foobar');
    await user.type(password.childNodes[0], 'password123');
    await user.type(confirmPassword.childNodes[0], 'password123');

    const emailValue = await screen.findByTestId('email');
    const fullNameValue = await screen.findByTestId('full_name');
    const passwordValue = await screen.findByTestId('password');
    const confirmPasswordValue = await screen.findByTestId('confirm_password');

    expect(emailValue.childNodes[0].value).toMatch(/foo@foobar.com/i);
    expect(fullNameValue.childNodes[0].value).toMatch(/foobar/i);
    expect(passwordValue.childNodes[0].value).toMatch(/password123/i);
    expect(confirmPasswordValue.childNodes[0].value).toMatch(/password123/i);
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
