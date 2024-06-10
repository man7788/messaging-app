import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { chatContext } from '../../../../contexts/chatContext';
import { useRef } from 'react';
import NewGroupList from './NewGroupList';
import * as GroupCreateFetch from '../../../../fetch/groups/GroupCreateAPI';

afterEach(() => {
  vi.clearAllMocks();
});

const GroupCreateFetchSpy = vi.spyOn(GroupCreateFetch, 'default');

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

describe('Friend list', () => {
  test('should show error', async () => {
    render(
      <chatContext.Provider value={{ setChatProfile: vi.fn() }}>
        <NewGroupList
          loginId={'9999'}
          friends={null}
          friendsLoading={false}
          friendsError={'error message'}
          setChangeSlide={vi.fn()}
          onShowChats={vi.fn()}
          setChatId={vi.fn()}
        />
        ,
      </chatContext.Provider>,
    );

    const error = await screen.findByTestId('error');

    expect(error).toBeInTheDocument;
  });

  test('should show loading', async () => {
    render(
      <chatContext.Provider value={{ setChatProfile: vi.fn() }}>
        <NewGroupList
          loginId={'9999'}
          friends={null}
          friendsLoading={true}
          friendsError={null}
          setChangeSlide={vi.fn()}
          onShowChats={vi.fn()}
          setChatId={vi.fn()}
        />
      </chatContext.Provider>,
    );

    const loading = await screen.findByTestId('loading');

    expect(loading).toBeInTheDocument;
  });

  test('should show empty friend list', async () => {
    render(
      <chatContext.Provider value={{ setChatProfile: vi.fn() }}>
        <NewGroupList
          loginId={'9999'}
          friends={[]}
          friendsLoading={false}
          friendsError={null}
          setChangeSlide={vi.fn()}
          onShowChats={vi.fn()}
          setChatId={vi.fn()}
        />
        ,
      </chatContext.Provider>,
    );

    const empty = await screen.findByText('Friend list is empty');

    expect(empty).toBeInTheDocument();
  });

  test('should show list of friends', async () => {
    render(
      <chatContext.Provider value={{ setChatProfile: vi.fn() }}>
        <NewGroupList
          loginId={'9999'}
          friends={[
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
          ]}
          friendsLoading={false}
          friendsError={null}
          setChangeSlide={vi.fn()}
          onShowChats={vi.fn()}
          setChatId={vi.fn()}
        />
        ,
      </chatContext.Provider>,
    );

    const friends = await screen.findAllByTestId('group');

    expect(friends).toHaveLength(2);
  });

  test('should show list of friends in overflow', async () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    useRef.mockReturnValueOnce({
      current: { scrollHeight: 1000, clientHeight: 500 },
    });

    render(
      <chatContext.Provider value={{ setChatProfile: vi.fn() }}>
        <NewGroupList
          loginId={'9999'}
          friends={[
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
          ]}
          friendsLoading={false}
          friendsError={null}
          setChangeSlide={vi.fn()}
          onShowChats={vi.fn()}
          setChatId={vi.fn()}
        />
        ,
      </chatContext.Provider>,
    );

    const friends = await screen.findAllByTestId('group');

    expect(friends).toHaveLength(2);
  });
});

describe('New group form', () => {
  test('should render new group form', async () => {
    render(
      <chatContext.Provider value={{ setChatProfile: vi.fn() }}>
        <NewGroupList
          loginId={'9999'}
          friends={[
            {
              user_id: '1002',
              _id: '22',
              full_name: 'foobar2',
              online: true,
            },
          ]}
          friendsLoading={false}
          friendsError={null}
          onShowFriends={vi.fn()}
          setChangeSlide={vi.fn()}
          onShowChats={vi.fn()}
          setChatId={vi.fn()}
        />
        ,
      </chatContext.Provider>,
    );

    const newGroupForm = await screen.findByTestId('new-group-form');
    const input = await screen.findByRole('textbox');
    const checkbox = await screen.findByRole('checkbox');

    expect(newGroupForm).toBeInTheDocument;
    expect(input.value).toMatch('');
    expect(checkbox.checked).toBe(false);
  });

  test('should show user input value', async () => {
    const user = userEvent.setup();

    render(
      <chatContext.Provider value={{ setChatProfile: vi.fn() }}>
        <NewGroupList
          loginId={'9999'}
          friends={[
            {
              user_id: '1002',
              _id: '22',
              full_name: 'foobar2',
              online: true,
            },
          ]}
          friendsLoading={false}
          friendsError={null}
          onShowFriends={vi.fn()}
          setChangeSlide={vi.fn()}
          onShowChats={vi.fn()}
          setChatId={vi.fn()}
        />
        ,
      </chatContext.Provider>,
    );

    const input = await screen.findByRole('textbox');
    const checkbox = await screen.findByRole('checkbox');

    await user.type(input, 'new group name');
    await user.click(checkbox);

    expect(input.value).toMatch('new group name');
    expect(checkbox.checked).toBe(true);
  });

  test('should show error after form submit', async () => {
    const user = userEvent.setup();

    GroupCreateFetchSpy.mockReturnValue({
      error: true,
    });

    render(
      <chatContext.Provider value={{ setChatProfile: vi.fn() }}>
        <NewGroupList
          loginId={'9999'}
          friends={[
            {
              user_id: '1002',
              _id: '22',
              full_name: 'foobar2',
              online: true,
            },
          ]}
          friendsLoading={false}
          friendsError={null}
          onShowFriends={vi.fn()}
          setChangeSlide={vi.fn()}
          onShowChats={vi.fn()}
          setChatId={vi.fn()}
        />
        ,
      </chatContext.Provider>,
    );

    const input = await screen.findByRole('textbox');
    const checkbox = await screen.findByRole('checkbox');

    await user.type(input, 'group name');
    await user.click(checkbox);

    const submit = await screen.findByTestId('new-group-submit');

    await user.click(submit);

    const error = await screen.findByTestId('error');

    expect(error).toBeInTheDocument;
  });

  test('should show loading after form submit', async () => {
    const user = userEvent.setup();

    GroupCreateFetchSpy.mockReturnValue({});

    render(
      <chatContext.Provider value={{ setChatProfile: vi.fn() }}>
        <NewGroupList
          loginId={'9999'}
          friends={[
            {
              user_id: '1002',
              _id: '22',
              full_name: 'foobar2',
              online: true,
            },
          ]}
          friendsLoading={false}
          friendsError={null}
          onShowFriends={vi.fn()}
          setChangeSlide={vi.fn()}
          onShowChats={vi.fn()}
          setChatId={vi.fn()}
        />
        ,
      </chatContext.Provider>,
    );

    const input = await screen.findByRole('textbox');
    const checkbox = await screen.findByRole('checkbox');

    await user.type(input, 'group name');
    await user.click(checkbox);

    const submit = await screen.findByTestId('new-group-submit');

    await user.click(submit);

    const loading = await screen.findByTestId('loading');

    expect(loading).toBeInTheDocument;
  });

  test('should submit form', async () => {
    const user = userEvent.setup();
    const createdGroup = { name: 'new group', users: ['id1', 'id2'] };

    GroupCreateFetchSpy.mockReturnValue({
      responseData: { group: createdGroup },
    });

    render(
      <chatContext.Provider value={{ setChatProfile: vi.fn() }}>
        <NewGroupList
          loginId={'9999'}
          friends={[
            {
              user_id: '1002',
              _id: '22',
              full_name: 'foobar2',
              online: true,
            },
          ]}
          friendsLoading={false}
          friendsError={null}
          onShowFriends={vi.fn()}
          setChangeSlide={vi.fn()}
          onShowChats={vi.fn()}
          setChatId={vi.fn()}
        />
        ,
      </chatContext.Provider>,
    );

    const input = await screen.findByRole('textbox');
    const checkbox = await screen.findByRole('checkbox');
    await user.type(input, 'group name');
    await user.click(checkbox);

    const submit = await screen.findByTestId('new-group-submit');
    await user.click(submit);

    expect(GroupCreateFetchSpy).toHaveBeenCalledWith({
      group_name: 'group name',
      user_id_list: ['1002'],
    });
  });

  test('should not submit form if group name or group member is empty', async () => {
    const user = userEvent.setup();

    render(
      <chatContext.Provider value={{ setChatProfile: vi.fn() }}>
        <NewGroupList
          loginId={'9999'}
          friends={[
            {
              user_id: '1002',
              _id: '22',
              full_name: 'foobar2',
              online: true,
            },
          ]}
          friendsLoading={false}
          friendsError={null}
          onShowFriends={vi.fn()}
          setChangeSlide={vi.fn()}
          onShowChats={vi.fn()}
          setChatId={vi.fn()}
        />
        ,
      </chatContext.Provider>,
    );

    const input = await screen.findByRole('textbox');
    const checkbox = await screen.findByRole('checkbox');

    await waitFor(() =>
      expect(screen.queryByTestId('new-group-submit')).toBe(null),
    );
    await user.type(input, '{enter}');

    expect(GroupCreateFetchSpy).not.toHaveBeenCalled();

    await user.clear(input);
    await user.click(checkbox);
    await waitFor(() =>
      expect(screen.queryByTestId('new-group-submit')).toBe(null),
    );
    await user.type(input, '{enter}');

    expect(GroupCreateFetchSpy).not.toHaveBeenCalled();
  });
});
