import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';
import * as useProfiles from '../../../fetch/UserAPI';

afterEach(() => {
  vi.clearAllMocks();
});

vi.spyOn(useProfiles, 'default').mockReturnValue({
  profiles: [
    { full_name: 'foobar', _id: '1111id', user_id: 'id1111' },
    { full_name: 'foobar2', _id: '2222id', user_id: 'id2222' },
    { full_name: 'foobar3', _id: '3333id', user_id: 'id3333' },
    { full_name: 'foobar4', _id: '4444id', user_id: 'id4444' },
  ],
  profilesLoading: false,
  profilesError: null,
});

describe('User List', () => {
  test('should show list of users', async () => {
    render(
      <Sidebar name={'foobar'} loginId={'id1111'} showHamburger={() => null} />,
    );

    const userButtons = await screen.findAllByRole('button', {
      name: /foobar/i,
    });

    expect(userButtons).toHaveLength(3);
  });
});
