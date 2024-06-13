import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserList from './UserList';
import { useRef } from 'react';

import * as useProfiles from '../../../../fetch/users/useProfilesAPI';
import * as useRequests from '../../../../fetch/users/useRequestsAPI';
import * as RequestCreateFetch from '../../../../fetch/users/RequestCreateAPI';
import * as FriendCreateFetch from '../../../../fetch/users/FriendCreateAPI';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRef: vi.fn(() => {
      return {
        current: { scrollHeight: 500, clientHeight: 1000 },
      };
    }),
  };
});

const requestCreateSpy = vi.spyOn(RequestCreateFetch, 'default');
const FriendCreateFetchSpy = vi.spyOn(FriendCreateFetch, 'default');
const useProfilesSpy = vi.spyOn(useProfiles, 'default');
const useRequestsSpy = vi.spyOn(useRequests, 'default').mockReturnValue({
  requests: null,
  requestsLoading: false,
  requestsError: null,
});

const friends = [
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
];

describe('User list', () => {
  describe('should show error', async () => {
    test('when useProfiles error', async () => {
      useProfilesSpy.mockReturnValue({
        profiles: null,
        profilesLoading: false,
        profilesError: true,
      });

      render(
        <UserList
          loginId={'1001'}
          friends={friends}
          friendsLoading={false}
          friendsError={null}
          userListSlide={true}
        />,
      );

      const error = await screen.findAllByTestId('error');
      expect(error).toBeInTheDocument;
    });

    test('when useFriends error', async () => {
      useProfilesSpy.mockReturnValue({
        profiles: null,
        profilesLoading: false,
        profilesError: null,
      });

      render(
        <UserList
          loginId={'1001'}
          friends={null}
          friendsLoading={false}
          friendsError={'error message'}
          userListSlide={true}
        />,
      );

      const error = await screen.findAllByTestId('error');
      expect(error).toBeInTheDocument;
    });

    test('when useRequests error', async () => {
      useRequestsSpy.mockReturnValue({
        requests: null,
        requestsLoading: false,
        requestsError: true,
      });

      render(
        <UserList
          loginId={'1001'}
          friends={null}
          friendsLoading={false}
          friendsError={null}
          userListSlide={true}
        />,
      );

      const error = await screen.findAllByTestId('error');
      expect(error).toBeInTheDocument;
    });
  });

  describe('should show loading', async () => {
    test('when useProfiles is loading', async () => {
      useProfilesSpy.mockReturnValue({
        profiles: null,
        profilesLoading: true,
        profilesError: null,
      });

      useRequestsSpy.mockReturnValue({
        requests: null,
        requestsLoading: false,
        requestsError: null,
      });

      render(
        <UserList
          loginId={'1001'}
          friends={null}
          friendsLoading={false}
          friendsError={null}
          userListSlide={true}
        />,
      );

      const loading = await screen.findAllByTestId('loading');
      expect(loading).toBeInTheDocument;
    });

    test('when useFriends is loading', async () => {
      useProfilesSpy.mockReturnValue({
        profiles: null,
        profilesLoading: false,
        profilesError: null,
      });

      render(
        <UserList
          loginId={'1001'}
          friends={null}
          friendsLoading={true}
          friendsError={null}
          userListSlide={true}
        />,
      );

      const loading = await screen.findAllByTestId('loading');
      expect(loading).toBeInTheDocument;
    });

    test('when useRequests is loading', async () => {
      useRequestsSpy.mockReturnValue({
        requests: null,
        requestsLoading: true,
        requestsError: null,
      });

      render(
        <UserList
          loginId={'1001'}
          friends={null}
          friendsLoading={false}
          friendsError={null}
          userListSlide={true}
        />,
      );

      const loading = await screen.findAllByTestId('loading');
      expect(loading).toBeInTheDocument;
    });
  });

  test('should show users that are not friends', async () => {
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

    useRequestsSpy.mockReturnValue({
      requests: [],
      requestsLoading: false,
      requestsError: null,
    });

    render(
      <UserList
        loginId={'1001'}
        friends={friends}
        friendsLoading={false}
        friendsError={null}
        userListSlide={true}
      />,
    );

    const users = await screen.findAllByTestId('user');

    expect(users).toHaveLength(3);
    expect(users[0].textContent).toMatch(/foobar4/);
    expect(users[1].textContent).toMatch(/foobar5/);
    expect(users[2].textContent).toMatch(/foobar6/);
  });

  test('should show users that are not friends in overflow', async () => {
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

    useRequestsSpy.mockReturnValue({
      requests: [],
      requestsLoading: false,
      requestsError: null,
    });

    useRef
      .mockReturnValueOnce({
        current: { scrollHeight: 1000, clientHeight: 500 },
      })
      .mockReturnValueOnce({
        current: { scrollHeight: 1000, clientHeight: 500 },
      })
      .mockReturnValueOnce({
        current: { scrollHeight: 1000, clientHeight: 500 },
      })
      .mockReturnValueOnce({
        current: { scrollHeight: 1000, clientHeight: 500 },
      })
      .mockReturnValueOnce({
        current: { scrollHeight: 1000, clientHeight: 500 },
      });

    render(
      <UserList
        loginId={'1001'}
        friends={friends}
        friendsLoading={false}
        friendsError={null}
        userListSlide={true}
      />,
    );

    const list = await screen.findByTestId('user-list');
    const users = await screen.findAllByTestId('user');

    expect(list.className).toMatch(/UserListFlowActive/i);
    expect(users).toHaveLength(3);
    expect(users[0].textContent).toMatch(/foobar4/);
    expect(users[1].textContent).toMatch(/foobar5/);
    expect(users[2].textContent).toMatch(/foobar6/);
  });

  describe('send request button', async () => {
    beforeEach(() => {
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

      useRequestsSpy.mockReturnValue({
        requests: [],
        requestsLoading: false,
        requestsError: null,
      });
    });

    test('should show error after clicking send request', async () => {
      const user = userEvent.setup();

      requestCreateSpy.mockReturnValue({ error: 'error' });

      render(
        <UserList
          loginId={'1001'}
          friends={friends}
          friendsLoading={false}
          friendsError={null}
          userListSlide={true}
        />,
      );

      const users = await screen.findAllByTestId('user');
      const sendRequest = users[0].childNodes[2];
      await user.click(sendRequest);

      expect(requestCreateSpy).toHaveBeenCalledTimes(1);
      expect(users[0].textContent).toMatch('A network error was encountered');
    });

    test('should show loading after clicking send request', async () => {
      const user = userEvent.setup();

      requestCreateSpy.mockReturnValueOnce({});

      render(
        <UserList
          loginId={'1001'}
          friends={friends}
          friendsLoading={false}
          friendsError={null}
          userListSlide={true}
        />,
      );

      const users = await screen.findAllByTestId('user');
      const sendRequest = users[0].childNodes[2];
      await user.click(sendRequest);

      expect(requestCreateSpy).toHaveBeenCalledTimes(1);
      expect(users[0].dataset.testid).toMatch('loading');
    });

    test('should show request sent after clicking send request', async () => {
      const user = userEvent.setup();

      requestCreateSpy.mockReturnValue({
        responseData: { createdRequest: {} },
      });

      render(
        <UserList
          loginId={'1001'}
          friends={friends}
          friendsLoading={false}
          friendsError={null}
          userListSlide={true}
        />,
      );

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

      requestCreateSpy.mockReturnValue({
        responseData: { createdRequest: {} },
      });

      render(
        <UserList
          loginId={'1001'}
          friends={friends}
          friendsLoading={false}
          friendsError={null}
          userListSlide={true}
        />,
      );

      const buttons = await screen.findAllByRole('button');
      const userButton = buttons[1];
      await user.click(userButton);

      const users = await screen.findAllByTestId('user');

      expect(users[1].childNodes[2].textContent).toMatch('Request Sent');
    });
  });

  describe('accept request button', async () => {
    beforeEach(() => {
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

      useRequestsSpy.mockReturnValue({
        requests: [
          { from: '1001', to: '1005' },
          { from: '1006', to: '1001' },
        ],
        requestsLoading: false,
        requestsError: null,
      });
    });

    test('should show error after clicking accept request', async () => {
      const user = userEvent.setup();

      FriendCreateFetchSpy.mockReturnValue({ error: 'error' });

      render(
        <UserList
          loginId={'1001'}
          friends={friends}
          friendsLoading={false}
          friendsError={null}
          userListSlide={true}
        />,
      );

      const users = await screen.findAllByTestId('user');
      const acceptRequest = users[2].childNodes[2];
      await user.click(acceptRequest);

      expect(FriendCreateFetchSpy).toHaveBeenCalledTimes(1);
      expect(users[2].textContent).toMatch('A network error was encountered');
    });

    test('should show loading after clicking accept request', async () => {
      const user = userEvent.setup();

      FriendCreateFetchSpy.mockReturnValue({});

      render(
        <UserList
          loginId={'1001'}
          friends={friends}
          friendsLoading={false}
          friendsError={null}
          userListSlide={true}
        />,
      );

      const users = await screen.findAllByTestId('user');
      const acceptRequest = users[2].childNodes[2];
      await user.click(acceptRequest);

      expect(FriendCreateFetchSpy).toHaveBeenCalledTimes(1);
      expect(users[2].dataset.testid).toMatch('loading');
    });

    test('should remove user from list after clicking accept request', async () => {
      const user = userEvent.setup();

      FriendCreateFetchSpy.mockReturnValue({ responseData: {} });

      render(
        <UserList
          loginId={'1001'}
          friends={friends}
          friendsLoading={false}
          friendsError={null}
          userListSlide={true}
        />,
      );

      const users = await screen.findAllByTestId('user');

      expect(users).toHaveLength(3);
      expect(users[2].textContent).toMatch(/foobar6/);

      const acceptRequest = users[2].childNodes[2];
      await user.click(acceptRequest);

      const updatedUsers = await screen.findAllByTestId('user');

      expect(FriendCreateFetchSpy).toHaveBeenCalledTimes(1);
      expect(updatedUsers).toHaveLength(2);
      expect(updatedUsers[2]).not.toMatch(/foobar6/);
    });
  });
});
