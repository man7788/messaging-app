import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
import * as useProfiles from '../../../fetch/users/UserAPI';
import * as useFriends from '../../../fetch/users/useFriendsAPI';
import * as useRequests from '../../../fetch/users/useRequestsAPI';
import * as LogoutFetch from '../../../fetch/messenger/LogoutAPI';
import * as RequestCreateFetch from '../../../fetch/users/RequestCreateAPI';
import * as FriendFetch from '../../../fetch/users/FriendAPI';
import * as useGroups from '../../../fetch/groups/useGroupsAPI';

import { chatContext } from '../../../contexts/chatContext';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

const requestCreateSpy = vi.spyOn(RequestCreateFetch, 'default');
const FriendFetchSpy = vi.spyOn(FriendFetch, 'default');
const useProfilesSpy = vi.spyOn(useProfiles, 'default');
const useFriendsSpy = vi.spyOn(useFriends, 'default');
const useGroupsSpy = vi.spyOn(useGroups, 'default');
const useRequestsSpy = vi.spyOn(useRequests, 'default');

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
  setUpdateFriends: vi.fn(),
});

useRequestsSpy.mockReturnValue({
  requests: [
    { from: '1001', to: '1005' },
    { from: '1006', to: '1001' },
  ],
  requestsLoading: false,
  requestsError: false,
});

describe('Header', () => {
  test('should show user name', async () => {
    render(<Sidebar name={'foobar'} loginId={'1001'} />);

    const userDiv = await screen.findByText(/^foobar$/i);

    expect(userDiv.textContent).toMatch(/foobar$/i);
  });

  test('should show header buttons and hamburger', async () => {
    render(<Sidebar name={'foobar'} loginId={'1001'} />);

    const buttons = await screen.findAllByRole('button');

    expect(buttons[0].childNodes[0].src).toMatch(/chat/i);
    expect(buttons[1].childNodes[0].src).toMatch(/person_add/i);
    expect(buttons[2].childNodes[0].src).toMatch(/hamburger/i);
  });

  test('should show default sidebar when click on back arrow', async () => {
    const user = userEvent.setup();
    const setContentArea = vi.fn();

    render(
      <chatContext.Provider value={{ setContentArea }}>
        <Sidebar name={'foobar'} loginId={'1001'} showHamburger={true} />
      </chatContext.Provider>,
    );

    const hamburgerButton = screen.getByTestId('hamburger');
    await user.click(hamburgerButton);

    const settings = await screen.findByText(/settings/i);
    await user.click(settings);

    const backButton = await screen.findAllByRole('button');
    const settingsTitle = await screen.findByText(/settings/i);
    const settingList = await screen.findByTestId(/setting-list/i);

    expect(backButton[0]).toBeInTheDocument();
    expect(settingsTitle).toBeInTheDocument();
    expect(settingList).toBeInTheDocument();

    await user.click(backButton[0]);

    const sidebar = await screen.findByTestId('sidebar');

    expect(sidebar).toBeInTheDocument();
  });
});

describe('Hamburger', () => {
  test('should show setting list when click on settings', async () => {
    const user = userEvent.setup();

    render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={true} />);

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

  test('should navigate to App when click on log out', async () => {
    const user = userEvent.setup();

    render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={true} />);

    const hamburgerButton = screen.getByTestId('hamburger');
    await user.click(hamburgerButton);

    const logout = await screen.findByText(/log out/i);
    await user.click(logout);

    const MessengerDiv = await screen.findByText(/redirected/i);

    expect(MessengerDiv.textContent).toMatch(/Redirected to \//i);
  });

  test('should clear local storage when click on log out', async () => {
    const user = userEvent.setup();

    render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={true} />);

    const logout = await screen.findByText(/log out/i);
    await user.click(logout);

    expect(localStorage.clear).toHaveBeenCalled();
  });
});

describe('Chat list', () => {
  describe('Friends', () => {
    test('should show error', async () => {
      useFriendsSpy.mockReturnValueOnce({
        friends: null,
        friendsLoading: false,
        friendsError: true,
      });

      render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

      const error = await screen.findAllByTestId('error');

      expect(error).toBeInTheDocument;
    });

    test('should show loading', async () => {
      useFriendsSpy.mockReturnValueOnce({
        friends: null,
        friendsLoading: true,
        friendsError: false,
      });

      render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

      const loading = await screen.findAllByTestId('loading');

      expect(loading).toBeInTheDocument;
    });

    test('should show empty friend list', async () => {
      render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

      const empty = await screen.findByText('Chat list is empty');

      expect(empty).toBeInTheDocument();
    });

    test('should show list of friends', async () => {
      useFriendsSpy.mockReturnValue({
        friends: [
          {
            user_id: '1002',
            _id: '22',
            full_name: 'foobar2',
            online: true,
          },
          {
            user_id: '1003',
            _id: '33',
            full_name: 'foobar3',
            online: false,
          },
        ],
        friendsLoading: false,
        friendsError: null,
        setUpdateFriends: vi.fn(),
      });

      render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

      const userButtons = await screen.findAllByRole('button', {
        name: /foobar/i,
      });

      expect(userButtons).toHaveLength(2);
    });

    test('should show online friends', async () => {
      render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

      const userButtons = await screen.findAllByRole('button', {
        name: /foobar/i,
      });

      expect(userButtons[0].childNodes[0].childNodes[1].className).toMatch(
        /dot/,
      );
      expect(userButtons[1].childNodes[0].childNodes[1]).not.toBeInTheDocument;
    });
  });

  describe('Groups', () => {
    test('should show error', async () => {
      useGroupsSpy.mockReturnValueOnce({
        groups: null,
        groupsLoading: false,
        groupsError: true,
      });

      render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

      const error = await screen.findAllByTestId('error');

      expect(error).toBeInTheDocument;
    });

    test('should show loading', async () => {
      useGroupsSpy.mockReturnValueOnce({
        groups: null,
        groupsLoading: true,
        groupsError: false,
      });

      render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

      const loading = await screen.findAllByTestId('loading');

      expect(loading).toBeInTheDocument;
    });

    test('should show empty group list', async () => {
      useFriendsSpy.mockReturnValueOnce({
        friends: [],
        friendsLoading: false,
        friendsError: false,
        setUpdateFriends: vi.fn(),
      });

      useGroupsSpy.mockReturnValueOnce({
        groups: [],
        groupsLoading: false,
        groupsError: false,
      });

      render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

      const empty = await screen.findByText('Chat list is empty');

      expect(empty).toBeInTheDocument();
    });

    test('should show list of groups', async () => {
      useGroupsSpy.mockReturnValue({
        groups: [
          { name: 'group1', _id: 'id1111g' },
          { name: 'group2', _id: 'id2222g' },
        ],
        groupsLoading: false,
        groupsError: null,
      });

      render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

      const groupButtons = await screen.findAllByRole('button', {
        name: /group/i,
      });

      expect(groupButtons).toHaveLength(2);
    });
  });

  test('should show list of friends and groups', async () => {
    render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

    const userButtons = await screen.findAllByRole('button', {
      name: /foobar/i,
    });

    const groupButtons = await screen.findAllByRole('button', {
      name: /group/i,
    });

    expect(userButtons).toHaveLength(2);
    expect(groupButtons).toHaveLength(2);
  });
});

describe('User list', () => {
  describe('should show error', async () => {
    test('when useProfiles error', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      useProfilesSpy
        .mockReturnValueOnce({
          profiles: null,
          profilesLoading: true,
          profilesError: null,
        })
        .mockReturnValueOnce({
          profiles: null,
          profilesLoading: false,
          profilesError: true,
        });

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const error = await screen.findAllByTestId('error');
      expect(error).toBeInTheDocument;
    });

    test('when useFriends error', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      useFriendsSpy
        .mockReturnValueOnce({
          friends: null,
          friendsLoading: true,
          friendsError: null,
        })
        .mockReturnValueOnce({
          friends: null,
          friendsLoading: false,
          friendsError: true,
        });

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const error = await screen.findAllByTestId('error');
      expect(error).toBeInTheDocument;
    });

    test('when useRequests error', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      useRequestsSpy
        .mockReturnValueOnce({
          requests: null,
          requestsLoading: true,
          requestsError: null,
        })
        .mockReturnValueOnce({
          requests: null,
          requestsLoading: true,
          requestsError: null,
        })
        .mockReturnValueOnce({
          requests: null,
          requestsLoading: false,
          requestsError: true,
        });

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const error = await screen.findAllByTestId('error');
      expect(error).toBeInTheDocument;
    });
  });

  describe('should show loading', async () => {
    test('when useProfiles is loading', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      useProfilesSpy
        .mockReturnValueOnce({
          profiles: null,
          profilesLoading: true,
          profilesError: null,
        })
        .mockReturnValueOnce({
          profiles: null,
          profilesLoading: true,
          profilesError: null,
        });

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const loading = await screen.findAllByTestId('loading');
      expect(loading).toBeInTheDocument;
    });

    test('when useFriends is loading', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      useFriendsSpy
        .mockReturnValueOnce({
          friends: null,
          friendsLoading: true,
          friendsError: null,
        })
        .mockReturnValueOnce({
          friends: null,
          friendsLoading: true,
          friendsError: null,
        });

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const loading = await screen.findAllByTestId('loading');
      expect(loading).toBeInTheDocument;
    });

    test('when useRequests is loading', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      useRequestsSpy
        .mockReturnValueOnce({
          requests: null,
          requestsLoading: true,
          requestsError: null,
        })
        .mockReturnValueOnce({
          requests: null,
          requestsLoading: true,
          requestsError: null,
        })
        .mockReturnValueOnce({
          requests: null,
          requestsLoading: true,
          requestsError: null,
        });

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const loading = await screen.findAllByTestId('loading');
      expect(loading).toBeInTheDocument;
    });
  });

  test('should show users that are not friends', async () => {
    const user = userEvent.setup();
    const setContentArea = vi.fn();

    render(
      <chatContext.Provider value={{ setContentArea }}>
        <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
      </chatContext.Provider>,
    );

    const buttons = await screen.findAllByRole('button');
    const userButton = buttons[1];
    await user.click(userButton);

    const users = await screen.findAllByTestId('user');

    expect(users).toHaveLength(3);
    expect(users[0].textContent).toMatch(/foobar4/);
    expect(users[1].textContent).toMatch(/foobar5/);
    expect(users[2].textContent).toMatch(/foobar6/);
  });

  describe('send request button', async () => {
    test('should show error after clicking send request', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      requestCreateSpy.mockReturnValueOnce({ error: 'error' });

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const users = await screen.findAllByTestId('user');
      const sendRequest = users[0].childNodes[2];
      await user.click(sendRequest);

      expect(requestCreateSpy).toHaveBeenCalledTimes(1);
      expect(users[0].textContent).toMatch('A network error was encountered');
    });

    test('should show loading after clicking send request', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      requestCreateSpy.mockReturnValueOnce();

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const users = await screen.findAllByTestId('user');
      const sendRequest = users[0].childNodes[2];
      await user.click(sendRequest);

      expect(requestCreateSpy).toHaveBeenCalledTimes(1);
      expect(users[0].dataset.testid).toMatch('loading');
    });

    test('should show request sent after clicking send request', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      requestCreateSpy.mockReturnValueOnce({ responseData: {} });

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const users = await screen.findAllByTestId('user');
      const sendRequest = users[0].childNodes[2];

      expect(sendRequest.textContent).toMatch('Send Request');

      await user.click(sendRequest);

      const updatedUsers = await screen.findAllByTestId('user');

      expect(requestCreateSpy).toHaveBeenCalledTimes(1);
      expect(updatedUsers[0].childNodes[2].textContent).toMatch('Request Sent');
    });

    test('should show request sent when user list is rendered', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      requestCreateSpy.mockReturnValueOnce({ responseData: {} });

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const users = await screen.findAllByTestId('user');

      expect(users[1].childNodes[2].textContent).toMatch('Request Sent');
    });
  });

  describe('accept request button', async () => {
    test('should show error after clicking accept request', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      FriendFetchSpy.mockReturnValueOnce({ error: 'error' });

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const users = await screen.findAllByTestId('user');
      const acceptRequest = users[2].childNodes[2];
      await user.click(acceptRequest);

      expect(FriendFetchSpy).toHaveBeenCalledTimes(1);
      expect(users[2].textContent).toMatch('A network error was encountered');
    });

    test('should show loading after clicking accept request', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      FriendFetchSpy.mockReturnValueOnce();

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const users = await screen.findAllByTestId('user');
      const acceptRequest = users[2].childNodes[2];
      await user.click(acceptRequest);

      expect(FriendFetchSpy).toHaveBeenCalledTimes(1);
      expect(users[2].dataset.testid).toMatch('loading');
    });

    test('should remove user from list after clicking accept request', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      FriendFetchSpy.mockReturnValueOnce({ responseData: {} });

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={false} />
        </chatContext.Provider>,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const users = await screen.findAllByTestId('user');

      expect(users).toHaveLength(3);
      expect(users[2].textContent).toMatch(/foobar6/);

      const acceptRequest = users[2].childNodes[2];
      await user.click(acceptRequest);

      const updatedUsers = await screen.findAllByTestId('user');

      expect(FriendFetchSpy).toHaveBeenCalledTimes(1);
      expect(updatedUsers).toHaveLength(2);
      expect(updatedUsers[2]).not.toMatch(/foobar6/);
    });
  });
});
