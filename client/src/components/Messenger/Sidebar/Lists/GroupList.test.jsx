import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupList from './GroupList';
import * as GroupCreateFetch from '../../../../fetch/groups/GroupCreateAPI';

const GroupCreateFetchSpy = vi.spyOn(GroupCreateFetch, 'default');

describe('Friend list', () => {
  test('should show error', async () => {
    render(
      <GroupList friends={null} friendsLoading={false} friendsError={true} />,
    );

    const error = await screen.findByTestId('error');

    expect(error).toBeInTheDocument;
  });

  test('should show loading', async () => {
    render(
      <GroupList friends={null} friendsLoading={true} friendsError={null} />,
    );

    const loading = await screen.findByTestId('loading');

    expect(loading).toBeInTheDocument;
  });

  test('should show empty friend list', async () => {
    render(
      <GroupList friends={[]} friendsLoading={false} friendsError={null} />,
    );

    const empty = await screen.findByText('Friend list is empty');

    expect(empty).toBeInTheDocument();
  });

  test('should show list of friends', async () => {
    render(
      <GroupList
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
      />,
    );

    const friends = await screen.findAllByTestId('group');

    expect(friends).toHaveLength(2);
  });
});

describe('New group form', () => {
  test('should render new group form', async () => {
    render(
      <GroupList
        friends={[
          {
            user_id: '1002',
            _id: '22',
            full_name: 'foobar2',
            online: true,
          },
        ]}
        friendsLoading={false}
        friendsError={false}
        onShowFriends={vi.fn()}
      />,
    );

    const newGroupForm = await screen.findByTestId('new-group-form');
    const input = await screen.findByRole('textbox');
    const checkbox = await screen.findByRole('checkbox');

    expect(newGroupForm).toBeInTheDocument;
    expect(input.value).toMatch('');
    expect(checkbox.checked).toBe(false);
  });

  test('should show form error', async () => {
    const user = userEvent.setup();

    GroupCreateFetchSpy.mockReturnValue({
      formErrors: [{ msg: 'form error message' }],
    });

    render(
      <GroupList
        friends={[]}
        friendsLoading={false}
        friendsError={false}
        onShowFriends={vi.fn()}
      />,
    );

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const formError = await screen.findByText(/form error message/i);

    expect(formError).toBeInTheDocument;
  });

  test('should reset form error', async () => {
    const user = userEvent.setup();

    GroupCreateFetchSpy.mockReturnValue({
      formErrors: [{ msg: 'form error message' }],
    });

    render(
      <GroupList
        friends={[
          {
            user_id: '1002',
            _id: '22',
            full_name: 'foobar2',
            online: true,
          },
        ]}
        friendsLoading={false}
        friendsError={false}
        onShowFriends={vi.fn()}
      />,
    );

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const formError = await screen.findByText(/form error message/i);

    expect(formError).toBeInTheDocument;

    const input = await screen.findByRole('textbox');
    await user.type(input, 'some text');

    expect(formError).not.toBeInTheDocument;

    const submit2 = await screen.findByRole('button');
    await user.click(submit2);

    const formError2 = await screen.findByText(/form error message/i);
    expect(formError2).toBeInTheDocument;

    const checkbox = await screen.findByRole('checkbox');
    await user.click(checkbox);

    expect(formError2).not.toBeInTheDocument;
  });

  test('should submit form', async () => {
    const user = userEvent.setup();
    const createdGroup = { name: 'new group', users: ['id1', 'id2'] };

    GroupCreateFetchSpy.mockReturnValue({
      responseData: { group: createdGroup },
    });

    render(
      <GroupList
        friends={[
          {
            user_id: '1002',
            _id: '22',
            full_name: 'foobar2',
            online: true,
          },
        ]}
        friendsLoading={false}
        friendsError={false}
        onShowFriends={vi.fn()}
      />,
    );

    const submit = await screen.findByRole('button');

    const input = await screen.findByRole('textbox');
    await user.type(input, 'group name');

    const checkbox = await screen.findByRole('checkbox');
    await user.click(checkbox);

    await user.click(submit);

    expect(GroupCreateFetchSpy).toHaveBeenCalledWith({
      group_name: 'group name',
      user_id_list: ['1002'],
    });
  });
});
