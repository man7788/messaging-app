import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';
import * as useProfiles from '../../../fetch/UserAPI';

afterEach(() => {
  vi.clearAllMocks();
});

vi.spyOn(useProfiles, 'default').mockReturnValue({
  profiles: [
    { full_name: 'foobar', _id: '1', user_id: '1001' },
    { full_name: 'foobar2', _id: '2', user_id: '1002' },
    { full_name: 'foobar3', _id: '3', user_id: '1003' },
    { full_name: 'foobar4', _id: '4', user_id: '1004' },
  ],
  profilesLoading: false,
  profilesError: null,
});

test('should show user name', async () => {
  render(<Sidebar name={'foobar'} loginId={'1001'} />);

  const userDiv = await screen.findByText(/^foobar$/i);

  expect(userDiv.textContent).toMatch(/foobar$/i);
});

describe('User List', () => {
  test('should show list of users', async () => {
    render(<Sidebar name={'foobar'} loginId={'1001'} showHamburger={null} />);

    const userButtons = await screen.findAllByRole('button', {
      name: /foobar/i,
    });

    expect(userButtons).toHaveLength(3);
  });
});
