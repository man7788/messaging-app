import { render, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { chatContext } from '../../../../contexts/chatContext';
import ChatList from './ChatList';
import * as useGroups from '../../../../fetch/groups/useGroupsAPI';

afterEach(() => {
  vi.clearAllMocks();
});

const useGroupsSpy = vi.spyOn(useGroups, 'default');

useGroupsSpy.mockReturnValue({
  groups: [],
  groupsLoading: false,
  groupsError: null,
  updateGroups: null,
  setUpdateGroups: vi.fn(),
});

const friends = [
  {
    chat_id: '1112',
    user_id: '1002',
    _id: '22',
    full_name: 'foobar2',
    online: true,
  },
  {
    chat_id: '1113',
    user_id: '1003',
    _id: '33',
    full_name: 'foobar3',
    online: false,
  },
];

describe('Chat list', () => {
  describe('Friends', () => {
    test('should show error', async () => {
      render(
        <ChatList
          friends={null}
          friendsLoading={false}
          friendsError={'error message'}
        />,
      );

      const error = await screen.findAllByTestId('error');

      expect(error).toBeInTheDocument;
    });

    test('should show loading', async () => {
      render(
        <ChatList friends={null} friendsLoading={true} friendsError={null} />,
      );

      const loading = await screen.findAllByTestId('loading');

      expect(loading).toBeInTheDocument;
    });

    test('should show empty chat list', async () => {
      render(
        <ChatList friends={[]} friendsLoading={false} friendsError={null} />,
      );

      const empty = await screen.findByText('Chat list is empty');

      expect(empty).toBeInTheDocument();
    });

    test('should show list of friends', async () => {
      render(
        <BrowserRouter>
          <ChatList
            friends={friends}
            friendsLoading={false}
            friendsError={null}
          />
          ,
        </BrowserRouter>,
      );

      const userButtons = await screen.findAllByRole('link', {
        name: /foobar/i,
      });

      expect(userButtons).toHaveLength(2);
    });

    test('should show online friends', async () => {
      render(
        <BrowserRouter>
          <ChatList
            friends={friends}
            friendsLoading={false}
            friendsError={null}
          />
          ,
        </BrowserRouter>,
      );

      const userButtons = await screen.findAllByRole('link', {
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
        groups: [],
        groupsLoading: false,
        groupsError: true,
        updateGroups: null,
        setUpdateGroups: vi.fn(),
      });

      render(
        <ChatList
          friends={friends}
          friendsLoading={false}
          friendsError={null}
        />,
      );
      const error = await screen.findAllByTestId('error');

      expect(error).toBeInTheDocument;
    });

    test('should show loading', async () => {
      useGroupsSpy.mockReturnValueOnce({
        groups: [],
        groupsLoading: true,
        groupsError: null,
        updateGroups: null,
        setUpdateGroups: vi.fn(),
      });

      render(
        <ChatList
          friends={friends}
          friendsLoading={false}
          friendsError={null}
        />,
      );
      const loading = await screen.findAllByTestId('loading');

      expect(loading).toBeInTheDocument;
    });

    test('should show empty group list', async () => {
      render(
        <ChatList friends={[]} friendsLoading={false} friendsError={null} />,
      );

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
        updateGroups: null,
        setUpdateGroups: vi.fn(),
      });

      render(
        <BrowserRouter>
          <ChatList friends={[]} friendsLoading={false} friendsError={null} />,
        </BrowserRouter>,
      );

      const groupButtons = await screen.findAllByRole('link', {
        name: /group/i,
      });

      expect(groupButtons).toHaveLength(2);
    });
  });

  test('should show list of friends and groups', async () => {
    useGroupsSpy.mockReturnValue({
      groups: [
        { name: 'group1', _id: 'id1111g' },
        { name: 'group2', _id: 'id2222g' },
      ],
      groupsLoading: false,
      groupsError: null,
      updateGroups: null,
      setUpdateGroups: vi.fn(),
    });

    render(
      <BrowserRouter>
        <ChatList
          friends={friends}
          friendsLoading={false}
          friendsError={null}
        />
        ,
      </BrowserRouter>,
    );

    const userButtons = await screen.findAllByRole('link', {
      name: /foobar/i,
    });

    const groupButtons = await screen.findAllByRole('link', {
      name: /group/i,
    });

    expect(userButtons).toHaveLength(2);
    expect(groupButtons).toHaveLength(2);
  });

  test('should set chat profile when click on chat item', async () => {
    const user = userEvent.setup();
    const setChatProfile = vi.fn();

    act(() => {
      render(
        <chatContext.Provider
          value={{
            setChatProfile,
          }}
        >
          <BrowserRouter>
            <ChatList
              friends={friends}
              friendsLoading={false}
              friendsError={null}
            />
          </BrowserRouter>
        </chatContext.Provider>,
      );
    });

    const link = await screen.findByRole('link', { name: 'foobar2' });
    await user.click(link);

    expect(setChatProfile).toHaveBeenCalledWith({
      chat_id: '1112',
      user_id: '1002',
      _id: '22',
      full_name: 'foobar2',
      online: true,
    });
  });

  test('should not set chat profile when click on active chat item', async () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    const user = userEvent.setup();
    const setChatProfile = vi.fn();

    act(() => {
      render(
        <chatContext.Provider
          value={{
            setChatProfile,
          }}
        >
          <BrowserRouter>
            <ChatList
              friends={friends}
              friendsLoading={false}
              friendsError={null}
              chatId={'1112'}
            />
          </BrowserRouter>
        </chatContext.Provider>,
      );
    });

    expect(setChatProfile).toHaveBeenCalledTimes(1);

    const activeLink = await screen.findByRole('link', { name: 'foobar2' });

    expect(activeLink.className).toMatch(/linkActive/i);

    await user.click(activeLink);

    expect(setChatProfile).toHaveBeenCalledTimes(1);
  });

  test('should highlight active chat', async () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    const setChatProfile = vi.fn();

    useGroupsSpy.mockReturnValue({
      groups: [
        { name: 'group1', _id: 'id1111g' },
        { name: 'group2', _id: 'id2222g' },
      ],
      groupsLoading: false,
      groupsError: null,
      updateGroups: null,
      setUpdateGroups: vi.fn(),
    });

    act(() => {
      render(
        <chatContext.Provider
          value={{
            setChatProfile,
          }}
        >
          <BrowserRouter>
            <ChatList
              friends={friends}
              friendsLoading={false}
              friendsError={null}
              chatId={'1112'}
            />
          </BrowserRouter>
        </chatContext.Provider>,
      );
    });

    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(
      1,
    );
    expect(setChatProfile).toHaveBeenCalledTimes(1);
    expect(setChatProfile).toHaveBeenCalledWith({
      chat_id: '1112',
      user_id: '1002',
      _id: '22',
      full_name: 'foobar2',
      online: true,
    });

    const activeLink = await screen.findByRole('link', { name: 'foobar2' });
    expect(activeLink.className).toMatch(/linkActive/i);

    const nonActiveFriend = await screen.findByRole('link', {
      name: 'foobar3',
    });
    const nonActiveGroup = await screen.findAllByRole('link', {
      name: /group/i,
    });

    expect(nonActiveFriend.className).toMatch(/linkDiv/i);
    for (const group of nonActiveGroup) {
      expect(group.className).toMatch(/linkDiv/i);
    }
  });
});
