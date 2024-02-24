import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Password from './Password';
import * as useStatus from '../../../fetch/StatusAPI';
import * as PasswordFetch from '../../../fetch/PasswordAPI';

afterEach(() => {
  vi.clearAllMocks();
});

const useStatusSpy = vi.spyOn(useStatus, 'default');
const PasswordFetchSpy = vi.spyOn(PasswordFetch, 'default');

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

describe('from useStatus result', () => {
  test('should render error page', async () => {
    useStatusSpy.mockReturnValue({
      result: null,
      loading: false,
      serverError: true,
    });

    render(<Password />);

    const error = screen.getByTestId('error');

    expect(error).toBeInTheDocument();
  });

  test('should render loading page', async () => {
    useStatusSpy.mockReturnValue({
      result: null,
      loading: true,
      serverError: null,
    });

    render(<Password />);

    const loading = screen.getByTestId('loading');

    expect(loading).toBeInTheDocument();
  });
});

describe('Password form', () => {
  beforeEach(() => {
    useStatusSpy.mockReturnValue({
      result: {
        profile: { full_name: 'foobar', about: 'first child', _id: '1001' },
      },
      loading: false,
      serverError: null,
    });
  });

  test('should display user input value', async () => {
    const user = userEvent.setup();

    render(<Password />);

    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/^new password/i);
    const ConfirmNewPassword = screen.getByLabelText(/confirm new password/i);

    await user.type(currentPassword, 'oldpassword');
    await user.type(newPassword, 'newpassword');
    await user.type(ConfirmNewPassword, ' newpassword');

    expect(currentPassword.value).toMatch(/oldpassword/i);
    expect(newPassword.value).toMatch(/newpassword/i);
    expect(ConfirmNewPassword.value).toMatch(/newpassword/i);
  });

  test('should redirect to App if form submit without jwt', async () => {
    const user = userEvent.setup();

    PasswordFetchSpy.mockReturnValue({
      error: 'missing token',
    });

    render(<Password />);

    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/^new password/i);
    const ConfirmNewPassword = screen.getByLabelText(/confirm new password/i);

    await user.type(currentPassword, 'oldpassword');
    await user.type(newPassword, 'newpassword');
    await user.type(ConfirmNewPassword, ' newpassword');

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const PasswordDiv = await screen.findByText(/redirected/i);

    expect(PasswordDiv.textContent).toMatch(/Redirected to \//i);
  });

  test('should render error page if form server error', async () => {
    const user = userEvent.setup();

    PasswordFetchSpy.mockReturnValue({
      error: 'server error',
    });

    render(<Password />);

    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/^new password/i);
    const ConfirmNewPassword = screen.getByLabelText(/confirm new password/i);

    await user.type(currentPassword, 'oldpassword');
    await user.type(newPassword, 'newpassword');
    await user.type(ConfirmNewPassword, ' newpassword');

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const error = screen.getByTestId('error');

    expect(error).toBeInTheDocument();
  });
});
