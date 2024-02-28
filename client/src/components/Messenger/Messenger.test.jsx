import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Messenger from './Messenger';
import * as useStatus from '../../fetch/StatusAPI';
import * as useProfiles from '../../fetch/UserAPI';
import * as Chat from './Content/Chat/Chat';
import * as messagesFetch from '../../fetch/MessageAPI';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

const useStatusSpy = vi.spyOn(useStatus, 'default');

vi.spyOn(useProfiles, 'default').mockReturnValue({
  profiles: [{ full_name: 'foobar2', _id: 'id2222' }],
  profilesLoading: false,
  profilesError: null,
});

const chatSpy = vi.spyOn(Chat, 'default');

vi.spyOn(messagesFetch, 'default').mockReturnValue({
  messages: [],
});

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

    const MessengerDiv = await screen.findByText(/redirected/i);

    expect(MessengerDiv.textContent).toMatch(/Redirected to \//i);
  });
});

describe('Sidebar', () => {
  beforeEach(() => {
    useStatusSpy.mockReturnValue({
      result: { profile: { full_name: 'foobar' } },
      loading: false,
      serverError: null,
    });
  });

  describe('Hambuger', () => {
    test('should show dropdown when click on hamburger', async () => {
      const user = userEvent.setup();

      render(<Messenger />);
      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const dropdown = await screen.findByTestId(/dropdown/i);
      const settings = await screen.findByText(/setting/i);
      const logout = await screen.findByText(/log out/i);

      expect(hamburgerButton.className).toMatch(/buttonactive/i);
      expect(dropdown).toBeInTheDocument();
      expect(settings).toBeInTheDocument();
      expect(logout).toBeInTheDocument();
    });

    test('should hide dropdown when click on hamburger', async () => {
      const user = userEvent.setup();

      render(<Messenger />);
      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const dropdown = await screen.findByTestId(/dropdown/i);
      const settings = await screen.findByText(/setting/i);
      const logout = await screen.findByText(/log out/i);

      expect(dropdown).toBeInTheDocument();
      expect(settings).toBeInTheDocument();
      expect(logout).toBeInTheDocument();

      await user.click(hamburgerButton);

      expect(hamburgerButton.className).toMatch('');
      expect(dropdown).not.toBeInTheDocument();
      expect(settings).not.toBeInTheDocument();
      expect(logout).not.toBeInTheDocument();
    });

    test('should hide dropdown when click outside hamburger', async () => {
      const user = userEvent.setup();

      render(<Messenger />);

      const hamburgerButton = screen.getByTestId('hamburger');
      const sidebar = await screen.findByTestId('sidebar');
      const chat = await screen.findByTestId('no-chat');

      await user.click(hamburgerButton);
      const dropdown = await screen.findByTestId(/dropdown/i);
      expect(dropdown).toBeInTheDocument();

      await user.click(sidebar);
      expect(dropdown).not.toBeInTheDocument();

      await user.click(hamburgerButton);
      const dropdown2 = await screen.findByTestId(/dropdown/i);
      expect(dropdown2).toBeInTheDocument();

      await user.click(chat);
      expect(dropdown2).not.toBeInTheDocument();
    });

    test('should hide dropdown when click on settings', async () => {
      const user = userEvent.setup();

      render(<Messenger />);

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const dropdown = await screen.findByTestId(/dropdown/i);
      expect(dropdown).toBeInTheDocument();

      const settings = await screen.findByText(/settings/i);
      await user.click(settings);

      expect(dropdown).not.toBeInTheDocument();
    });
  });

  describe('User List', () => {
    test('should show chat page when click on user', async () => {
      const user = userEvent.setup();
      window.HTMLElement.prototype.scrollIntoView = function () {};

      render(<Messenger />);

      const userButton = screen.getByRole('button', { name: /foobar2$/i });

      await user.click(userButton);

      const chatTitle = await screen.findByTestId('chat-title');

      expect(chatTitle.textContent).toMatch(/foobar2$/i);
    });
  });

  describe('Settings', () => {
    beforeEach(() => {
      chatSpy.mockReturnValue(<div>No chats selected</div>);
    });

    test('should show edit page when click on edit profile', async () => {
      const user = userEvent.setup();

      render(<Messenger />);

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const settings = await screen.findByText(/settings/i);
      await user.click(settings);

      const editProfileButton = await screen.findByText(/edit profile/i);
      await user.click(editProfileButton);

      const editProfile = await screen.findByRole('heading', {
        name: /edit profile/i,
      });

      expect(editProfile).toBeInTheDocument();
    });

    test('should show password page when click on change password', async () => {
      const user = userEvent.setup();

      render(<Messenger />);

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const settings = await screen.findByText(/settings/i);
      await user.click(settings);

      const editProfileButton = await screen.findByText(/change password/i);
      await user.click(editProfileButton);

      const changePassword = await screen.findByRole('heading', {
        name: /change password/i,
      });

      expect(changePassword).toBeInTheDocument();
    });

    test('should show chat page when click on back arrow', async () => {
      const user = userEvent.setup();

      render(<Messenger />);

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const settings = await screen.findByText(/settings/i);
      await user.click(settings);

      const settingList = await screen.findByTestId(/setting-list/i);

      expect(settingList).toBeInTheDocument();

      const backButton = await screen.findAllByRole('button');
      await user.click(backButton[0]);

      const noChatsDiv = await screen.findByText(/no chats selected/i);

      expect(noChatsDiv.textContent).toMatch(/no chats selected/i);
    });
  });
});
