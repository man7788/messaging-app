import { render, screen, act } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { chatContext } from '../../../contexts/chatContext';
import Sidebar from './Sidebar';
import * as useProfiles from '../../../fetch/users/useProfilesAPI';
import * as useFriends from '../../../fetch/users/useFriendsAPI';
import * as useRequests from '../../../fetch/users/useRequestsAPI';
import * as LogoutFetch from '../../../fetch/messenger/LogoutAPI';
import * as useGroups from '../../../fetch/groups/useGroupsAPI';
import * as GroupCreateFetch from '../../../fetch/groups/GroupCreateAPI';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
    useLocation: vi.fn(() => {
      return { pathname: 'chat' };
    }),
  };
});

const useProfilesSpy = vi.spyOn(useProfiles, 'default');
const useFriendsSpy = vi.spyOn(useFriends, 'default');
const useGroupsSpy = vi.spyOn(useGroups, 'default');
const useRequestsSpy = vi.spyOn(useRequests, 'default');
const GroupCreateFetchSpy = vi.spyOn(GroupCreateFetch, 'default');

vi.spyOn(Storage.prototype, 'clear');

vi.spyOn(LogoutFetch, 'default').mockReturnValue({
  responseData: {
    updatedOnline: { online: false },
  },
});

useProfilesSpy.mockReturnValue({
  profiles: [
    { full_name: 'foobar', _id: '1', user_id: '1001' },
    { full_name: 'foobar2', _id: '2', user_id: '1002' },
    { full_name: 'foobar3', _id: '3', user_id: '1003' },
    { full_name: 'foobar4', _id: '4', user_id: '1004' },
    { full_name: 'foobar5', _id: '5', user_id: '1005' },
    { full_name: 'foobar6', _id: '6', user_id: '1006' },
  ],
  profilesLoading: false,
  profilesError: null,
});

useFriendsSpy.mockReturnValue({
  friends: [],
  friendsLoading: false,
  friendsError: false,
  setUpdateFriends: vi.fn(),
});

useGroupsSpy.mockReturnValue({
  groups: [],
  groupsLoading: false,
  groupsError: null,
  updateGroups: null,
  setUpdateGroups: vi.fn(),
});

useRequestsSpy.mockReturnValue({
  requests: [],
  requestsLoading: false,
  requestsError: false,
});

describe('Header', () => {
  test('should show user name', async () => {
    render(
      <BrowserRouter>
        <Sidebar name={'foobar'} loginId={'1001'} />
      </BrowserRouter>,
    );

    const userDiv = await screen.findByText(/^foobar$/i);

    expect(userDiv.textContent).toMatch(/foobar$/i);
  });

  test('should show header buttons and hamburger', async () => {
    render(
      <BrowserRouter>
        render(
        <Sidebar name={'foobar'} loginId={'1001'} /> );
      </BrowserRouter>,
    );

    const chatsLink = await screen.findByTestId('chats');
    const requestsLink = await screen.findByTestId('requests');
    const hambugerButton = await screen.findByTestId('hamburger');

    expect(chatsLink.childNodes[0].src).toMatch(/chat/i);
    expect(requestsLink.childNodes[0].src).toMatch(/person_add/i);
    expect(hambugerButton.childNodes[0].src).toMatch(/hamburger/i);
  });

  test('should show chat list on default', async () => {
    render(
      <BrowserRouter>
        <Sidebar name={'foobar'} loginId={'1001'} />
      </BrowserRouter>,
    );

    const chatList = await screen.findByTestId('chat-list');

    expect(chatList).toBeInTheDocument();
  });

  test('should show user list when click on requests button', async () => {
    const user = userEvent.setup();
    useLocation.mockImplementationOnce(() => {
      return { pathname: 'requests' };
    });

    render(
      <BrowserRouter>
        <Sidebar name={'foobar'} loginId={'1001'} />
      </BrowserRouter>,
    );

    const requestsLink = await screen.findByTestId('requests');

    await user.click(requestsLink);

    const userList = await screen.findByTestId('user-list');

    expect(userList).toBeInTheDocument();
  });

  test('should show chat list when click on chat button', async () => {
    const user = userEvent.setup();

    useLocation
      .mockImplementationOnce(() => {
        return { pathname: 'requests' };
      })
      .mockImplementationOnce(() => {
        return { pathname: 'chat' };
      });

    render(
      <BrowserRouter>
        render(
        <Sidebar name={'foobar'} loginId={'1001'} />
        );
      </BrowserRouter>,
    );

    const requestsLink = await screen.findByTestId('requests');
    await user.click(requestsLink);

    const userList = await screen.findByTestId('user-list');
    expect(userList).toBeInTheDocument();

    const chatsLink = await screen.findByTestId('chats');
    await user.click(chatsLink);

    const chatList = await screen.findByTestId('chat-list');

    expect(chatList).toBeInTheDocument();
  });
});

describe('Hamburger', () => {
  describe('new group', () => {
    test('should show new group list when click on new group', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Sidebar
            name={'foobar'}
            loginId={'1001'}
            showHamburger={true}
            setShowHamburger={vi.fn()}
          />
        </BrowserRouter>,
      );

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const newGroup = await screen.findByText(/new group/i);
      await user.click(newGroup);

      const groupList = await screen.findByTestId(/group-list/i);

      expect(groupList).toBeInTheDocument();
    });

    test('should show default sidebar when click on back arrow in new group list', async () => {
      const user = userEvent.setup();
      const setShowHamburger = vi.fn();
      const setShowChat = vi.fn();
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { rerender, unmount } = render(
        <BrowserRouter>
          <chatContext.Provider value={{ setShowChat }}>
            <Sidebar
              name={'foobar'}
              loginId={'1001'}
              showHamburger={true}
              setShowHamburger={setShowHamburger}
            />
          </chatContext.Provider>
        </BrowserRouter>,
      );

      const newGroup = await screen.findByText(/new group/i);
      await user.click(newGroup);

      expect(setShowHamburger).toHaveBeenCalledTimes(1);

      rerender(
        <BrowserRouter>
          <chatContext.Provider value={{ setShowChat }}>
            <Sidebar
              name={'foobar'}
              loginId={'1001'}
              showHamburger={false}
              setShowHamburger={setShowHamburger}
            />
          </chatContext.Provider>
        </BrowserRouter>,
      );

      await act(async () => {
        vi.runAllTimers();
      });

      const backLink = await screen.findByTestId('back');
      const groupTitle = await screen.findByText(/new group/i);
      const groupList = await screen.findByTestId(/group-list/i);

      expect(backLink).toBeInTheDocument();
      expect(groupTitle.className).toMatch(/title/i);
      expect(groupList).toBeInTheDocument();

      await user.click(backLink);
      expect(setShowChat).toHaveBeenCalledTimes(1);

      await act(async () => {
        vi.runAllTimers();
      });

      const sidebar = await screen.findByTestId('sidebar');
      const chatList = await screen.findByTestId('chat-list');

      expect(sidebar).toBeInTheDocument();
      expect(chatList).toBeInTheDocument();

      unmount();
    });
  });

  describe('settings', () => {
    test('should show setting list when click on settings', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <Sidebar
            name={'foobar'}
            loginId={'1001'}
            showHamburger={true}
            setShowHamburger={vi.fn()}
          />
        </BrowserRouter>,
      );

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const settings = await screen.findByText(/setting/i);
      await user.click(settings);

      const settingList = await screen.findByTestId(/setting-list/i);
      const editProfile = await screen.findByText(/edit profile/i);
      const changePassword = await screen.findByText(/change password/i);

      expect(settingList).toBeInTheDocument();
      expect(editProfile).toBeInTheDocument();
      expect(changePassword).toBeInTheDocument();
    });

    test('should show default sidebar when click on back arrow in setting list', async () => {
      const user = userEvent.setup();
      const setShowHamburger = vi.fn();
      const setShowChat = vi.fn();
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { rerender, unmount } = render(
        <BrowserRouter>
          <chatContext.Provider value={{ setShowChat }}>
            <Sidebar
              name={'foobar'}
              loginId={'1001'}
              showHamburger={true}
              setShowHamburger={setShowHamburger}
            />
          </chatContext.Provider>
        </BrowserRouter>,
      );

      const settings = await screen.findByText(/settings/i);
      await user.click(settings);

      expect(setShowHamburger).toHaveBeenCalledTimes(1);

      rerender(
        <BrowserRouter>
          <chatContext.Provider value={{ setShowChat }}>
            <Sidebar
              name={'foobar'}
              loginId={'1001'}
              showHamburger={false}
              setShowHamburger={setShowHamburger}
            />
          </chatContext.Provider>
        </BrowserRouter>,
      );

      await act(async () => {
        vi.runAllTimers();
      });

      const backLink = await screen.findByTestId('back');
      const settingsTitle = await screen.findByText(/settings/i);
      const settingList = await screen.findByTestId(/setting-list/i);

      expect(backLink).toBeInTheDocument();
      expect(settingsTitle.className).toMatch(/title/i);
      expect(settingList).toBeInTheDocument();

      await user.click(backLink);

      await act(async () => {
        vi.runAllTimers();
      });

      const sidebar = await screen.findByTestId('sidebar');
      const chatList = await screen.findByTestId('chat-list');

      expect(sidebar).toBeInTheDocument();
      expect(chatList).toBeInTheDocument();

      unmount();
    });
  });

  describe('log out', () => {
    test('should navigate to App when click on log out', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <Sidebar
            name={'foobar'}
            loginId={'1001'}
            showHamburger={true}
            setShowHamburger={vi.fn()}
          />
        </BrowserRouter>,
      );

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const logout = await screen.findByText(/log out/i);
      await user.click(logout);

      const MessengerDiv = await screen.findByText(/redirected/i);

      expect(MessengerDiv.textContent).toMatch(/Redirected to \//i);
    });

    test('should clear local storage when click on log out', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <Sidebar
            name={'foobar'}
            loginId={'1001'}
            showHamburger={true}
            setShowHamburger={vi.fn()}
          />
        </BrowserRouter>,
      );

      const logout = await screen.findByText(/log out/i);
      await user.click(logout);

      expect(localStorage.clear).toHaveBeenCalled();
    });
  });
});

describe('New group form', () => {
  test('should submit form and render chat list', async () => {
    const user = userEvent.setup();
    const setShowHamburger = vi.fn();
    const setShowChat = vi.fn();
    const setChatProfile = vi.fn();

    vi.useFakeTimers({ shouldAdvanceTime: true });

    useFriendsSpy.mockReturnValue({
      friends: [
        {
          user_id: '1002',
          _id: '22',
          full_name: 'foobar2',
          online: true,
        },
      ],
      friendsLoading: false,
      friendsError: null,
      setUpdateFriends: vi.fn(),
    });

    GroupCreateFetchSpy.mockReturnValue({
      responseData: { group: {} },
    });

    const { rerender, unmount } = render(
      <BrowserRouter>
        <chatContext.Provider value={{ setShowChat, setChatProfile }}>
          <Sidebar
            name={'foobar'}
            loginId={'1001'}
            showHamburger={true}
            setShowHamburger={setShowHamburger}
          />
        </chatContext.Provider>
      </BrowserRouter>,
    );

    const newGroup = await screen.findByText(/new group/i);
    await user.click(newGroup);
    expect(setShowHamburger).toHaveBeenCalledTimes(1);

    rerender(
      <BrowserRouter>
        <chatContext.Provider value={{ setShowChat, setChatProfile }}>
          <Sidebar
            name={'foobar'}
            loginId={'1001'}
            showHamburger={false}
            setShowHamburger={setShowHamburger}
          />
        </chatContext.Provider>
      </BrowserRouter>,
    );

    await act(async () => {
      vi.runAllTimers();
    });

    const input = await screen.findByRole('textbox');
    const checkbox = await screen.findByRole('checkbox');
    await user.type(input, 'groupname');
    await user.click(checkbox);

    const submit = await screen.findByTestId('new-group-submit');
    await user.click(submit);

    expect(GroupCreateFetchSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.runAllTimers();
    });

    const username = await screen.findByText('foobar');
    const chatList = await screen.findByTestId('chat-list');

    expect(username).toBeInTheDocument();
    expect(chatList).toBeInTheDocument();

    unmount();
  });
});
