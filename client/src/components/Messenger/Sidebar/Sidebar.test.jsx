import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
import { chatContext } from '../../../contexts/chatContext';
import * as useProfiles from '../../../fetch/users/UserAPI';
import * as useFriends from '../../../fetch/users/useFriendsAPI';
import * as useRequests from '../../../fetch/users/useRequestsAPI';
import * as LogoutFetch from '../../../fetch/messenger/LogoutAPI';
import * as useGroups from '../../../fetch/groups/useGroupsAPI';
import * as GroupCreateFetch from '../../../fetch/groups/GroupCreateAPI';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

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
  setUpdateFriends: vi.fn(),
});

useRequestsSpy.mockReturnValue({
  requests: [],
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

  test('should show chat list on default', async () => {
    render(<Sidebar name={'foobar'} loginId={'1001'} />);

    const chatList = await screen.findByTestId('chat-list');

    expect(chatList).toBeInTheDocument();
  });

  test('should show user list when click on add friend button', async () => {
    const user = userEvent.setup();
    const setContentArea = vi.fn();

    render(
      <chatContext.Provider value={{ setContentArea }}>
        <Sidebar name={'foobar'} loginId={'1001'} showHamburger={true} />
      </chatContext.Provider>,
    );

    const buttons = await screen.findAllByRole('button');

    await user.click(buttons[1]);

    const userList = await screen.findByTestId('user-list');

    expect(userList).toBeInTheDocument();
  });

  test('should show chat list when click on chat button', async () => {
    const user = userEvent.setup();
    const setContentArea = vi.fn();

    render(
      <chatContext.Provider value={{ setContentArea }}>
        <Sidebar name={'foobar'} loginId={'1001'} showHamburger={true} />
      </chatContext.Provider>,
    );

    const buttons = await screen.findAllByRole('button');

    await user.click(buttons[1]);

    const userList = await screen.findByTestId('user-list');

    expect(userList).toBeInTheDocument();

    await user.click(buttons[1]);

    const chatList = await screen.findByTestId('user-list');

    expect(chatList).toBeInTheDocument();
  });
});

describe('Hamburger', () => {
  describe('new group', () => {
    test('should show new group list when click on new group', async () => {
      const user = userEvent.setup();

      render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={true} />);
      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const newGroup = await screen.findByText(/new group/i);
      await user.click(newGroup);

      const groupList = await screen.findByTestId(/group-list/i);

      expect(groupList).toBeInTheDocument();
    });

    test('should show default sidebar when click on back arrow in new group list', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={true} />
        </chatContext.Provider>,
      );

      const hamburgerButton = screen.getByTestId('hamburger');
      await user.click(hamburgerButton);

      const newGroup = await screen.findByText(/new group/i);
      await user.click(newGroup);

      const backButton = await screen.findAllByRole('button');
      const groupTitle = await screen.findByText(/new group/i);
      const groupList = await screen.findByTestId(/group-list/i);

      expect(backButton[0]).toBeInTheDocument();
      expect(groupTitle).toBeInTheDocument();
      expect(groupList).toBeInTheDocument();

      await user.click(backButton[0]);

      const sidebar = await screen.findByTestId('sidebar');

      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('settings', () => {
    test('should show setting list when click on settings', async () => {
      const user = userEvent.setup();
      const setContentArea = vi.fn();

      render(
        <chatContext.Provider value={{ setContentArea }}>
          <Sidebar name={'foobar'} loginId={'1001'} showHamburger={true} />
        </chatContext.Provider>,
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

  describe('log out', () => {
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
});

describe('New group form', () => {
  test('should submit form and render chat list', async () => {
    const user = userEvent.setup();
    const setContentArea = vi.fn();

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
      responseData: {},
    });

    render(
      <chatContext.Provider value={{ setContentArea }}>
        <Sidebar name={'foobar'} loginId={'1001'} showHamburger={true} />
      </chatContext.Provider>,
    );

    const hamburgerButton = screen.getByTestId('hamburger');
    await user.click(hamburgerButton);
    const newGroup = await screen.findByText(/new group/i);
    await user.click(newGroup);

    const buttons = await screen.findAllByRole('button');

    const input = await screen.findByRole('textbox');
    await user.type(input, 'group name');

    const checkbox = await screen.findByRole('checkbox');
    await user.click(checkbox);

    await user.click(buttons[1]);

    const username = await screen.findByText('foobar');
    const chatList = await screen.findByTestId('chat-list');

    expect(username).toBeInTheDocument();
    expect(chatList).toBeInTheDocument();
  });
});
