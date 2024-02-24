import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Password from './Password';
import * as useStatus from '../../../fetch/StatusAPI';

afterEach(() => {
  vi.clearAllMocks();
});

const useStatusSpy = vi.spyOn(useStatus, 'default');

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
});
