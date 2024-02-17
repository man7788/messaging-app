import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Messenger from './Messenger';
import * as useStatus from '../../fetch/StatusAPI';
import * as useProfiles from '../../fetch/UserAPI';

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

const useStatusSpy = vi.spyOn(useStatus, 'default');

vi.spyOn(useProfiles, 'default').mockReturnValue({
  profiles: [
    { full_name: 'foobar2', _id: 'id2222' },
    { full_name: 'foobar3', _id: 'id3333' },
    { full_name: 'foobar4', _id: 'id4444' },
  ],
  profilesLoading: false,
  profilesError: null,
});

vi.mock('./Content/Chat/Chat.jsx', () => ({
  default: vi.fn().mockReturnValue(<div>No chats selected</div>),
}));

describe('from useStatus result', () => {
  test('should render error page', async () => {
    useStatusSpy.mockReturnValue({
      result: null,
      loading: false,
      serverError: true,
    });

    render(<Messenger />);

    const errorDiv = screen.getByTestId('error');

    expect(errorDiv).toBeInTheDocument();
  });

  test('should render loading page', () => {
    useStatusSpy.mockReturnValue({
      result: null,
      loading: true,
      serverError: null,
    });

    render(<Messenger />);

    const loadingDiv = screen.getByTestId('loading');

    expect(loadingDiv).toBeInTheDocument();
  });

  test('should navigate to App page', async () => {
    useStatusSpy.mockReturnValue({
      result: { error: 'token error message' },
      loading: false,
      serverError: null,
    });

    render(<Messenger />);

    const MessengerDiv = screen.getByText(/redirected/i);

    expect(MessengerDiv.textContent).toMatch(/Redirected to \//i);
  });
});

describe('Sidebar', () => {
  test('should show user name', async () => {
    useStatusSpy.mockReturnValue({
      result: { profile: { full_name: 'foobar' } },
      loading: false,
      serverError: null,
    });

    render(<Messenger />);

    const userDiv = screen.getByText(/foobar$/i);

    expect(userDiv.textContent).toMatch(/foobar$/i);
  });

  describe('Hambuger', () => {
    test('should show dropdown when click on hamburger', async () => {
      const user = userEvent.setup();

      useStatusSpy.mockReturnValue({
        result: { profile: { full_name: 'foobar' } },
        loading: false,
        serverError: null,
      });

      render(<Messenger />);
      const hamburgerButton = screen.getAllByRole('button');
      await user.click(hamburgerButton[0]);

      const dropdown = await screen.findByTestId(/dropdown/i);
      const settings = await screen.findByText(/setting/i);
      const logout = await screen.findByText(/log out/i);

      expect(dropdown).toBeInTheDocument();
      expect(settings).toBeInTheDocument();
      expect(logout).toBeInTheDocument();
    });

    test('should show setting list when click on settings', async () => {
      const user = userEvent.setup();

      useStatusSpy.mockReturnValue({
        result: { profile: { full_name: 'foobar' } },
        loading: false,
        serverError: null,
      });

      render(<Messenger />);
      const hamburgerButton = screen.getAllByRole('button');
      await user.click(hamburgerButton[0]);

      const settings = await screen.findByText(/setting/i);
      await user.click(settings);

      const settingList = await screen.findByTestId(/setting-list/i);
      const editProfile = await screen.findByText(/edit profile/i);
      const changePassword = await screen.findByText(/change password/i);

      expect(settingList).toBeInTheDocument();
      expect(editProfile).toBeInTheDocument();
      expect(changePassword).toBeInTheDocument();
    });
  });
});
