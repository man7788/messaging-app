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
        user: { full_name: 'foobar', about: 'first child', _id: '1001' },
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

  test('should show form validation errors', async () => {
    const user = userEvent.setup();

    PasswordFetchSpy.mockReturnValue({
      formErrors: [
        { msg: 'current password error' },
        { msg: 'password characters error' },
        { msg: 'passwords do not match' },
      ],
    });

    render(<Password />);

    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/^new password/i);
    const confirmNewPassword = screen.getByLabelText(/confirm new password/i);
    expect(currentPassword.parentNode.className).toMatch('');
    expect(newPassword.parentNode.className).toMatch('');
    expect(confirmNewPassword.parentNode.className).toMatch('');

    await user.type(currentPassword, 'oldpassword');
    await user.type(newPassword, 'newpassword');
    await user.type(confirmNewPassword, ' newpassword');

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const currentPasswordContainer =
      await screen.findByTestId('current-password');
    const newPasswordContainer = await screen.findByTestId('new-password');
    const confirmNewPasswordContainer = await screen.findByTestId(
      'confirm-new-password',
    );
    const success = await screen.findByTestId('success');

    expect(currentPasswordContainer.childNodes[1].className).toMatch(
      /inputoutline/i,
    );
    expect(newPasswordContainer.childNodes[1].className).toMatch(
      /inputoutline/i,
    );
    expect(confirmNewPasswordContainer.childNodes[1].className).toMatch(
      /inputoutline/i,
    );
    expect(currentPasswordContainer.textContent).toMatch(
      /current password error/i,
    );
    expect(newPasswordContainer.textContent).toMatch(
      /password characters error/i,
    );
    expect(confirmNewPasswordContainer.textContent).toMatch(
      /passwords do not match/i,
    );
    expect(success.textContent).not.toMatch(/profile successfully updated/i);
  });

  test('should reset form validation errors', async () => {
    const user = userEvent.setup();

    PasswordFetchSpy.mockReturnValue({
      formErrors: [
        { msg: 'current password error' },
        { msg: 'password characters error' },
        { msg: 'passwords do not match' },
      ],
    });

    render(<Password />);

    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/^new password/i);
    const confirmNewPassword = screen.getByLabelText(/confirm new password/i);
    expect(currentPassword.parentNode.className).toMatch('');
    expect(newPassword.parentNode.className).toMatch('');
    expect(confirmNewPassword.parentNode.className).toMatch('');

    await user.type(currentPassword, 'oldpassword');
    await user.type(newPassword, 'newpassword');
    await user.type(confirmNewPassword, ' newpassword');

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const currentPasswordContainer =
      await screen.findByTestId('current-password');
    const newPasswordContainer = await screen.findByTestId('new-password');
    const confirmNewPasswordContainer = await screen.findByTestId(
      'confirm-new-password',
    );
    const success = await screen.findByTestId('success');

    expect(currentPasswordContainer.childNodes[1].className).toMatch(
      /inputoutline/i,
    );
    expect(newPasswordContainer.childNodes[1].className).toMatch(
      /inputoutline/i,
    );
    expect(confirmNewPasswordContainer.childNodes[1].className).toMatch(
      /inputoutline/i,
    );
    expect(currentPasswordContainer.textContent).toMatch(
      /current password error/i,
    );
    expect(newPasswordContainer.textContent).toMatch(
      /password characters error/i,
    );
    expect(confirmNewPasswordContainer.textContent).toMatch(
      /passwords do not match/i,
    );
    expect(success.textContent).not.toMatch(/profile successfully updated/i);

    await user.type(currentPassword, 'new strings');
    await user.type(newPassword, 'new strings');
    await user.type(confirmNewPassword, 'new strings');

    expect(currentPasswordContainer.childNodes[1].className).toMatch('');
    expect(newPasswordContainer.childNodes[1].className).toMatch('');
    expect(confirmNewPasswordContainer.childNodes[1].className).toMatch('');
    expect(currentPasswordContainer.textContent).toMatch('');
    expect(newPasswordContainer.textContent).toMatch('');
    expect(confirmNewPasswordContainer.textContent).toMatch('');
  });

  test('should disable submit button if not all inputs have values', async () => {
    const user = userEvent.setup();

    PasswordFetchSpy.mockReturnValue({});

    render(<Password />);

    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/^new password/i);
    const confirmNewPassword = screen.getByLabelText(/confirm new password/i);

    await user.type(currentPassword, 'oldpassword');
    await user.type(newPassword, 'newpassword');

    const submit = await screen.findByRole('button');
    expect(submit.parentNode.className).toMatch(/savebtndefault/i);

    await user.click(submit);
    expect(PasswordFetchSpy).not.toHaveBeenCalled();

    await user.type(confirmNewPassword, 'newpassword');
    expect(submit.parentNode.className).toMatch(/savebtnactive/i);

    await user.click(submit);
    expect(PasswordFetchSpy).toHaveBeenCalled();
  });

  test('should show loading after clicking submit button', async () => {
    const user = userEvent.setup();

    PasswordFetchSpy.mockReturnValue({});

    render(<Password />);

    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/^new password/i);
    const ConfirmNewPassword = screen.getByLabelText(/confirm new password/i);

    await user.type(currentPassword, 'oldpassword');
    await user.type(newPassword, 'newpassword');
    await user.type(ConfirmNewPassword, ' newpassword');

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const loading = await screen.findByTestId('password-loading');

    expect(loading).toBeInTheDocument;
  });

  test('should submit user form with new values', async () => {
    const user = userEvent.setup();

    PasswordFetchSpy.mockReturnValue({
      responseData: {
        updated_user: {},
        previous_user: {},
      },
    });

    render(<Password />);

    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/^new password/i);
    const ConfirmNewPassword = screen.getByLabelText(/confirm new password/i);

    await user.type(currentPassword, 'oldpassword');
    await user.type(newPassword, 'newpassword');
    await user.type(ConfirmNewPassword, 'newpassword');

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const currentPasswordContainer =
      await screen.findByTestId('current-password');
    const newPasswordContainer = await screen.findByTestId('new-password');
    const ConfirmNewPasswordContainer = await screen.findByTestId(
      'confirm-new-password',
    );
    const success = await screen.findByTestId('success');

    expect(PasswordFetchSpy).toHaveBeenCalledWith({
      user_id: '1001',
      current_password: 'oldpassword',
      new_password: 'newpassword',
      confirm_new_password: 'newpassword',
    });

    expect(currentPasswordContainer.textContent).toMatch('');
    expect(newPasswordContainer.textContent).toMatch('');
    expect(ConfirmNewPasswordContainer.textContent).toMatch('');
    expect(success.textContent).toMatch(/password successfully updated/i);
  });
});
