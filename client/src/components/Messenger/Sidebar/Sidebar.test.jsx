import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
import * as useProfiles from '../../../fetch/UserAPI';
import * as useFriends from '../../../fetch/useFriendsAPI';
import * as LogoutFetch from '../../../fetch/LogoutAPI';
import { chatContext } from '../../../contexts/chatContext';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

vi.spyOn(Storage.prototype, 'clear');

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
      online: false,
    },
    {
      user_id: 'id1003',
      _id: '33',
      full_name: 'foobar3',
      online: false,
    },
  ],
  friendsLoading: false,
  friendsError: null,
  setUpdateFriends: vi.fn(),
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

  test('should show list of friends', async () => {
    render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

    const userButtons = await screen.findAllByRole('button', {
      name: /foobar/i,
    });

    expect(userButtons).toHaveLength(2);
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
});
