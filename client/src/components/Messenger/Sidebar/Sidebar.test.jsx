import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
import * as useProfiles from '../../../fetch/UserAPI';
import * as useFriends from '../../../fetch/useFriendsAPI';
import * as useRequests from '../../../fetch/useRequestsAPI';
import * as LogoutFetch from '../../../fetch/LogoutAPI';
import * as RequestCreateFetch from '../../../fetch/RequestCreateAPI';
import * as FriendFetch from '../../../fetch/FriendAPI';
import { chatContext } from '../../../contexts/chatContext';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

vi.spyOn(Storage.prototype, 'clear');
const requestCreateSpy = vi.spyOn(RequestCreateFetch, 'default');
const FriendFetchSpy = vi.spyOn(FriendFetch, 'default');

vi.spyOn(LogoutFetch, 'default').mockReturnValue({
  responseData: {
    updatedOnline: { online: false },
  },
});

const useProfilesSpy = vi.spyOn(useProfiles, 'default').mockReturnValue({
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

const useFriendsSpy = vi.spyOn(useFriends, 'default').mockReturnValue({
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

const useRequestsSpy = vi.spyOn(useRequests, 'default').mockReturnValue({
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

describe('Friend list', () => {
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
    useFriendsSpy.mockReturnValueOnce({
      friends: [],
      friendsLoading: false,
      friendsError: false,
    });

    render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

    const empty = await screen.findByText('Friend list is empty');

    expect(empty).toBeInTheDocument();
  });

  test('should show list of friends', async () => {
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

    expect(userButtons[0].childNodes[0].childNodes[1].className).toMatch(/dot/);
    expect(userButtons[1].childNodes[0].childNodes[1]).not.toBeInTheDocument;
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

      expect(users[0].textContent).toMatch('A network error was encountered');
    });
  });
});
