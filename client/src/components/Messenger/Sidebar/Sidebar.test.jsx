import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
import * as useProfiles from '../../../fetch/UserAPI';
import { chatContext } from '../../../contexts/chatContext';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

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

vi.spyOn(Storage.prototype, 'clear');

describe('Header', () => {
  test('should show user name', async () => {
    render(<Sidebar name={'foobar'} loginId={'1001'} />);

    const userDiv = await screen.findByText(/^foobar$/i);

    expect(userDiv.textContent).toMatch(/foobar$/i);
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

    const settingList = await screen.findByTestId(/setting-list/i);

    expect(settingList).toBeInTheDocument();

    const backButton = await screen.findAllByRole('button');
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

describe('User list', () => {
  test('should show error', async () => {
    useProfilesSpy.mockReturnValueOnce({
      profiles: null,
      profilesLoading: false,
      profilesError: true,
    });
    render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

    const error = await screen.findAllByTestId('error');

    expect(error).toBeInTheDocument;
  });

  test('should show loading', async () => {
    useProfilesSpy.mockReturnValueOnce({
      profiles: null,
      profilesLoading: true,
      profilesError: null,
    });
    render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

    const loading = await screen.findAllByTestId('loading');

    expect(loading).toBeInTheDocument;
  });

  test('should show list of users', async () => {
    render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

    const userButtons = await screen.findAllByRole('button', {
      name: /foobar/i,
    });

    expect(userButtons).toHaveLength(3);
  });
});
