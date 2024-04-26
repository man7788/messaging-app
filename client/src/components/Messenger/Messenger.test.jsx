import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Messenger from './Messenger';
import * as useStatus from '../../fetch/messenger/useStatusAPI';
import * as useFriends from '../../fetch/users/useFriendsAPI';
import * as messagesFetch from '../../fetch/chats/MessagesAPI';
import * as useGroups from '../../fetch/groups/useGroupsAPI';
import * as GroupMessagesFetch from '../../fetch/groups/GroupMessagesAPI';
import { BrowserRouter, Outlet, useLocation } from 'react-router-dom';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
    Outlet: vi.fn(() => (
      <div>
        <div data-testid="chat-title">
          <div>
            <img />
          </div>
          foobar2
        </div>
      </div>
    )),
    useLocation: vi.fn(() => {
      return { pathname: 'chat' };
    }),
  };
});

const useStatusSpy = vi.spyOn(useStatus, 'default');
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
      statusResult: null,
      statusLoading: false,
      statusError: true,
    });

    render(<Messenger />);

    const errorDiv = screen.getByTestId('error');

    expect(errorDiv).toBeInTheDocument();
  });

  test('should render loading page', () => {
    useStatusSpy.mockReturnValueOnce({
      statusResult: null,
      statusLoading: true,
      statusError: null,
    });

    render(<Messenger />);

    const loadingDiv = screen.getByTestId('loading');

    expect(loadingDiv).toBeInTheDocument();
  });

  test('should navigate to App page', async () => {
    useStatusSpy.mockReturnValueOnce({
      statusResult: { error: 'token error message' },
      statusLoading: false,
      statusError: null,
    });

    render(
      <BrowserRouter>
        <Messenger />
      </BrowserRouter>,
    );

    const MessengerDiv = await screen.findByText(/redirected/i);

    expect(MessengerDiv.textContent).toMatch(/Redirected to \//i);
  });
});

describe('Sidebar', () => {
  describe('Hambuger', () => {
    test('should show dropdown when click on hamburger', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <Messenger />
        </BrowserRouter>,
      );

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const dropdown = await screen.findByTestId(/dropdown/i);
      const settings = await screen.findByText(/setting/i);
      const logout = await screen.findByText(/log out/i);

      expect(hamburgerButton.className).toMatch(/hamburgerActive/i);
      expect(dropdown).toBeInTheDocument();
      expect(settings).toBeInTheDocument();
      expect(logout).toBeInTheDocument();
    });

    test('should hide dropdown when click on hamburger', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <Messenger />
        </BrowserRouter>,
      );

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

      Outlet.mockImplementationOnce(() => <div data-testid="no-chat"></div>);

      render(
        <BrowserRouter>
          <Messenger />
        </BrowserRouter>,
      );

      const hamburgerButton = screen.getByTestId('hamburger');
      const sidebar = await screen.findByTestId('sidebar');
      const chat = await screen.findByTestId('no-chat');

      await user.click(hamburgerButton);
      const dropdown = await screen.findByTestId(/dropdown/i);
      expect(dropdown).toBeInTheDocument();
      expect(hamburgerButton.className).toMatch(/hamburgerActive/i);

      await user.click(sidebar);
      expect(dropdown).not.toBeInTheDocument();
      expect(hamburgerButton.className).toMatch('');

      await user.click(hamburgerButton);
      const dropdown2 = await screen.findByTestId(/dropdown/i);
      expect(dropdown2).toBeInTheDocument();
      expect(hamburgerButton.className).toMatch(/hamburgerActive/i);

      await user.click(chat);
      expect(dropdown2).not.toBeInTheDocument();
      expect(hamburgerButton.className).toMatch('');
    });

    test('should hide dropdown when click on settings', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <Messenger />
        </BrowserRouter>,
      );

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const dropdown = await screen.findByTestId(/dropdown/i);
      expect(dropdown).toBeInTheDocument();
      expect(hamburgerButton.className).toMatch(/hamburgerActive/i);

      const settings = await screen.findByText(/settings/i);
      await user.click(settings);

      expect(dropdown).not.toBeInTheDocument();
      expect(hamburgerButton.className).toMatch('');
    });
  });

  describe('Chat List', () => {
    test('should show chat page when click on chat', async () => {
      const user = userEvent.setup();
      window.HTMLElement.prototype.scrollIntoView = function () {};

      render(
        <BrowserRouter>
          <Messenger />
        </BrowserRouter>,
      );

      await waitFor(async () => {
        expect(useFriendsSpy).toHaveBeenCalledTimes(1);
      });

      const userButton = screen.getByRole('button', { name: /foobar2$/i });
      expect(userButton.parentNode.className).toMatch(/buttondiv/i);

      await user.click(userButton);
      expect(userButton.parentNode.className).toMatch(/buttonActive/i);

      const chatTitle = await screen.findByTestId('chat-title');

      expect(chatTitle.textContent).toMatch(/foobar2$/i);
    });
  });

  describe('Settings', () => {
    test('should show edit page when click on edit profile', async () => {
      const user = userEvent.setup();

      Outlet.mockImplementation(() => <div data-testid="no-chat"></div>)
        .mockImplementationOnce(() => <div data-testid="no-chat"></div>)
        .mockImplementationOnce(() => <div data-testid="no-chat"></div>)
        .mockImplementationOnce(() => <h2>Edit Profile</h2>);

      useLocation.mockImplementation(() => {
        return { pathname: 'profile' };
      });

      render(
        <BrowserRouter>
          <Messenger />
        </BrowserRouter>,
      );

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const settings = await screen.findByText(/settings/i);
      await user.click(settings);

      const editProfileLink = await screen.findByText(/edit profile/i);

      expect(editProfileLink.className).toMatch(/Link/i);

      await user.click(editProfileLink);

      expect(editProfileLink.className).toMatch(/LinkActive/i);

      const editProfile = await screen.findByRole('heading', {
        name: /edit profile/i,
      });

      expect(editProfile).toBeInTheDocument();
    });

    test('should show password page when click on change password', async () => {
      const user = userEvent.setup();

      Outlet.mockImplementation(() => <div data-testid="no-chat"></div>)
        .mockImplementationOnce(() => <div data-testid="no-chat"></div>)
        .mockImplementationOnce(() => <div data-testid="no-chat"></div>)
        .mockImplementationOnce(() => <h2>Change Password</h2>);

      useLocation.mockImplementation(() => {
        return { pathname: 'password' };
      });

      render(
        <BrowserRouter>
          <Messenger />
        </BrowserRouter>,
      );

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const settings = await screen.findByText(/settings/i);
      await user.click(settings);

      const changePasswordLink = await screen.findByText(/change password/i);
      expect(changePasswordLink.className).toMatch(/Link/i);

      await user.click(changePasswordLink);

      expect(changePasswordLink.className).toMatch(/LinkActive/i);

      const changePassword = await screen.findByRole('heading', {
        name: /change password/i,
      });

      expect(changePassword).toBeInTheDocument();
    });

    test('should show chat page when click on back arrow', async () => {
      const user = userEvent.setup();

      Outlet.mockImplementation(() => <div data-testid="no-chat"></div>);

      render(
        <BrowserRouter>
          <Messenger />
        </BrowserRouter>,
      );

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const settings = await screen.findByText(/settings/i);
      await user.click(settings);

      const settingList = await screen.findByTestId(/setting-list/i);
      expect(settingList).toBeInTheDocument();

      const editProfileLink = await screen.findByText(/edit profile/i);
      await user.click(editProfileLink);

      const backLink = await screen.findAllByRole('link');
      await user.click(backLink[0]);

      const noChatsDiv = await screen.findByTestId('no-chat');

      expect(noChatsDiv).toBeInTheDocument();
    });
  });
});
