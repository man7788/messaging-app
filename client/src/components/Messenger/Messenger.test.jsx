import { render, screen, waitFor, act } from '@testing-library/react';
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
    Outlet: vi.fn(),

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
  statusResult: { user: { profile: { full_name: 'foobar' } } },
  statusLoading: false,
  statusError: null,
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
  setUpdateGroups: vi.fn(),
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
      vi.useFakeTimers({ shouldAdvanceTime: true });

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
      await act(async () => {
        vi.runAllTimers();
      });

      expect(hamburgerButton.className).toMatch('');
      expect(dropdown).not.toBeInTheDocument();
      expect(settings).not.toBeInTheDocument();
      expect(logout).not.toBeInTheDocument();
      vi.useRealTimers();
    });

    test('should hide dropdown when click outside hamburger', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers({ shouldAdvanceTime: true });

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
      await act(async () => {
        vi.runAllTimers();
      });

      expect(dropdown).not.toBeInTheDocument();
      expect(hamburgerButton.className).toMatch('button');

      await user.click(hamburgerButton);
      const dropdown2 = await screen.findByTestId(/dropdown/i);

      expect(dropdown2).toBeInTheDocument();
      expect(hamburgerButton.className).toMatch(/hamburgerActive/i);

      await user.click(chat);
      await act(async () => {
        vi.runAllTimers();
      });

      expect(dropdown2).not.toBeInTheDocument();
      expect(hamburgerButton.className).toMatch('');
      vi.useRealTimers();
    });

    test('should hide dropdown when click on new group', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers({ shouldAdvanceTime: true });

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

      const newGroup = await screen.findByText(/new group/i);
      await user.click(newGroup);
      await act(async () => {
        vi.runAllTimers();
      });

      expect(dropdown).not.toBeInTheDocument();
      expect(hamburgerButton.className).toMatch('');
      vi.useRealTimers();
    });

    test('should hide dropdown when click on settings', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers({ shouldAdvanceTime: true });

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
      await act(async () => {
        vi.runAllTimers();
      });

      expect(dropdown).not.toBeInTheDocument();
      expect(hamburgerButton.className).toMatch('');
      vi.useRealTimers();
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

      const chatLink = screen.getByRole('link', { name: /foobar2$/i });
      await user.click(chatLink);

      expect(chatLink.className).toMatch(/linkActive/i);

      const chatTitle = await screen.findByTestId('chat-title');

      expect(chatTitle.textContent).toMatch(/foobar2$/i);
    });
  });

  describe('Settings', () => {
    test('should show edit page when click on edit profile', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers({ shouldAdvanceTime: true });

      Outlet.mockImplementationOnce(() => null).mockImplementation(() => (
        <h2>Edit Profile</h2>
      ));

      useLocation
        .mockImplementationOnce(() => {
          return { pathname: 'user/settings' };
        })
        .mockImplementationOnce(() => {
          return { pathname: 'user/settings' };
        })
        .mockImplementationOnce(() => {
          return { pathname: 'user/settings' };
        })
        .mockImplementationOnce(() => {
          return { pathname: 'user/settings' };
        })
        .mockImplementationOnce(() => {
          return { pathname: 'user/settings' };
        })
        .mockImplementationOnce(() => {
          return { pathname: 'user/settings' };
        })
        .mockImplementation(() => {
          return { pathname: 'user/profile/edit' };
        });

      render(
        <BrowserRouter>
          <Messenger />
        </BrowserRouter>,
      );

      const editProfileLink = await screen.findByRole('link', {
        name: /edit profile/i,
      });

      expect(editProfileLink.className).toMatch(/Link(?!Active)/i);

      await user.click(editProfileLink);

      expect(editProfileLink.className).toMatch(/LinkActive/i);

      const editProfile = await screen.findByRole('heading', {
        name: /edit profile/i,
      });

      expect(editProfile).toBeInTheDocument();
    });

    test('should show password page when click on change password', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers({ shouldAdvanceTime: true });

      Outlet.mockImplementationOnce(() => null).mockImplementation(() => (
        <h2>Change Password</h2>
      ));

      useLocation
        .mockImplementationOnce(() => {
          return { pathname: 'user/settings' };
        })
        .mockImplementationOnce(() => {
          return { pathname: 'user/settings' };
        })
        .mockImplementationOnce(() => {
          return { pathname: 'user/settings' };
        })
        .mockImplementationOnce(() => {
          return { pathname: 'user/settings' };
        })
        .mockImplementationOnce(() => {
          return { pathname: 'user/settings' };
        })
        .mockImplementationOnce(() => {
          return { pathname: 'user/settings' };
        })
        .mockImplementation(() => {
          return { pathname: 'user/password/chage' };
        });

      render(
        <BrowserRouter>
          <Messenger />
        </BrowserRouter>,
      );

      const changePasswordLink = await screen.findByRole('link', {
        name: /change password/i,
      });

      expect(changePasswordLink.className).toMatch(/Link(?!Active)/i);

      await user.click(changePasswordLink);

      expect(changePasswordLink.className).toMatch(/LinkActive/i);

      const changePassword = await screen.findByRole('heading', {
        name: /change password/i,
      });

      expect(changePassword).toBeInTheDocument();
    });

    test('should show chat page when click on back arrow', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers({ shouldAdvanceTime: true });

      Outlet.mockImplementationOnce(() => null)
        .mockImplementationOnce(() => <h2>Edit Profile</h2>)
        .mockImplementation(() => null);

      useLocation.mockImplementation(() => {
        return { pathname: 'user/profile/edit' };
      });

      render(
        <BrowserRouter>
          <Messenger />
        </BrowserRouter>,
      );

      const editProfileLink = await screen.findByRole('link', {
        name: /edit profile/i,
      });
      await user.click(editProfileLink);
      const editProfile = await screen.findByRole('heading', {
        name: /edit profile/i,
      });

      expect(editProfile).toBeInTheDocument();

      const backLink = await screen.findByTestId('back');
      await user.click(backLink);
      await act(async () => {
        vi.runAllTimers();
      });

      const noChatsDiv = await screen.findByTestId('no-chat');

      expect(editProfile).not.toBeInTheDocument();
      expect(noChatsDiv).toBeInTheDocument();
    });
  });
});
