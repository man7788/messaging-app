import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Messenger from './Messenger';
import * as useStatus from '../../fetch/messenger/useStatusAPI';
import * as useFriends from '../../fetch/users/useFriendsAPI';
import * as messagesFetch from '../../fetch/chats/MessagesAPI';
import * as useGroups from '../../fetch/groups/useGroupsAPI';
import * as GroupMessagesFetch from '../../fetch/groups/GroupMessagesAPI';
import * as Chat from './Content/Chat/Chat';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

const useStatusSpy = vi.spyOn(useStatus, 'default');
const chatSpy = vi.spyOn(Chat, 'default');
const useFriendsSpy = vi.spyOn(useFriends, 'default');
const useGroupsSpy = vi.spyOn(useGroups, 'default');

vi.spyOn(messagesFetch, 'default').mockReturnValue({
  messages: [],
});

vi.spyOn(GroupMessagesFetch, 'default').mockReturnValue({
  messages: [],
});

useStatusSpy.mockReturnValue({
  result: { profile: { full_name: 'foobar' } },
  loading: false,
  serverError: null,
});

useFriendsSpy.mockReturnValue({
  friends: [
    {
      user_id: 'id2222',
      _id: 'id2222',
      full_name: 'foobar2',
      online: false,
    },
  ],
  friendsLoading: false,
  friendsError: null,
  setUpdateFriends: vi.fn(),
});

useGroupsSpy.mockReturnValue({
  groups: [{ name: 'group1', _id: 'id1111g' }],
  groupsLoading: false,
  groupsError: null,
  setUpdateFriends: vi.fn(),
});

describe('from useStatus result', () => {
  test('should render error page', async () => {
    useStatusSpy.mockReturnValueOnce({
      result: null,
      loading: false,
      serverError: true,
    });

    render(<Messenger />);

    const errorDiv = screen.getByTestId('error');

    expect(errorDiv).toBeInTheDocument();
  });

  test('should render loading page', () => {
    useStatusSpy.mockReturnValueOnce({
      result: null,
      loading: true,
      serverError: null,
    });

    render(<Messenger />);

    const loadingDiv = screen.getByTestId('loading');

    expect(loadingDiv).toBeInTheDocument();
  });

  test('should navigate to App page', async () => {
    useStatusSpy.mockReturnValueOnce({
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
      expect(hamburgerButton.className).toMatch(/buttonactive/i);

      await user.click(sidebar);
      expect(dropdown).not.toBeInTheDocument();
      expect(hamburgerButton.className).toMatch('');

      await user.click(hamburgerButton);
      const dropdown2 = await screen.findByTestId(/dropdown/i);
      expect(dropdown2).toBeInTheDocument();
      expect(hamburgerButton.className).toMatch(/buttonactive/i);

      await user.click(chat);
      expect(dropdown2).not.toBeInTheDocument();
      expect(hamburgerButton.className).toMatch('');
    });

    test('should hide dropdown when click on settings', async () => {
      const user = userEvent.setup();

      render(<Messenger />);

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const dropdown = await screen.findByTestId(/dropdown/i);
      expect(dropdown).toBeInTheDocument();
      expect(hamburgerButton.className).toMatch(/buttonactive/i);

      const settings = await screen.findByText(/settings/i);
      await user.click(settings);

      expect(dropdown).not.toBeInTheDocument();
      expect(hamburgerButton.className).toMatch('');
    });
  });

  describe('Chat List', () => {
    test('should show chat page when click on user', async () => {
      const user = userEvent.setup();
      window.HTMLElement.prototype.scrollIntoView = function () {};

      render(<Messenger />);

      await waitFor(async () => {
        expect(useFriendsSpy).toHaveBeenCalledTimes(2);
      });

      const userButton = screen.getByRole('button', { name: /foobar2$/i });
      expect(userButton.parentNode.className).toMatch(/buttondiv/i);

      await user.click(userButton);
      expect(userButton.parentNode.className).toMatch(/buttonactive/i);

      const chatTitle = await screen.findByTestId('chat-title');

      expect(chatTitle.textContent).toMatch(/foobar2$/i);
    });

    test('should show chat page when click on group', async () => {
      const user = userEvent.setup();
      window.HTMLElement.prototype.scrollIntoView = function () {};

      render(<Messenger />);

      await waitFor(async () => {
        expect(useFriendsSpy).toHaveBeenCalledTimes(2);
      });

      const groupButton = screen.getByRole('button', { name: /group1$/i });
      expect(groupButton.parentNode.className).toMatch(/buttondiv/i);

      await user.click(groupButton);
      expect(groupButton.parentNode.className).toMatch(/buttonactive/i);

      const chatTitle = await screen.findByTestId('chat-title');

      expect(chatTitle.textContent).toMatch(/group1$/i);
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
      expect(editProfileButton.parentNode.className).toMatch(/buttondiv/i);

      await user.click(editProfileButton);
      expect(editProfileButton.parentNode.className).toMatch(/buttonactive/i);

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

      const changePasswordButton = await screen.findByText(/change password/i);
      expect(changePasswordButton.parentNode.className).toMatch(/buttondiv/i);

      await user.click(changePasswordButton);
      expect(changePasswordButton.parentNode.className).toMatch(
        /buttonactive/i,
      );

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
