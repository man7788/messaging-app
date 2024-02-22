import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Edit from './Edit';
import * as useStatus from '../../../fetch/StatusAPI';
import * as EditFetch from '../../../fetch/EditAPI';

const useStatusSpy = vi.spyOn(useStatus, 'default');
const editFetchSpy = vi.spyOn(EditFetch, 'default');

describe('from useStatus result', () => {
  test('should render error page', async () => {
    useStatusSpy.mockReturnValue({
      result: null,
      loading: false,
      serverError: true,
    });

    render(<Edit />);

    const error = screen.getByTestId('error');

    expect(error).toBeInTheDocument();
  });

  test('should render loading page', async () => {
    useStatusSpy.mockReturnValue({
      result: null,
      loading: true,
      serverError: null,
    });

    render(<Edit />);

    const loading = screen.getByTestId('loading');

    expect(loading).toBeInTheDocument();
  });

  test('should show profile data in form inputs', async () => {
    useStatusSpy.mockReturnValue({
      result: { profile: { full_name: 'foobar', about: 'first child' } },
      loading: false,
      serverError: null,
    });

    render(<Edit />);

    const fullName = screen.getByLabelText(/full name/i);
    const about = screen.getByLabelText(/about/i);

    expect(fullName.value).toMatch(/foobar/i);
    expect(about.value).toMatch(/first child/i);
  });
});

describe('Edit form', () => {
  beforeEach(() => {
    useStatusSpy.mockReturnValue({
      result: { profile: { full_name: 'foobar', about: 'first child' } },
      loading: false,
      serverError: null,
    });
  });

  test('should display user input value', async () => {
    const user = userEvent.setup();

    render(<Edit />);

    const fullName = screen.getByLabelText(/full name/i);
    const about = screen.getByLabelText(/about/i);

    await user.type(fullName, ' 1st');
    await user.type(about, ' 1st');

    expect(fullName.value).toMatch(/foobar 1st/i);
    expect(about.value).toMatch(/first child 1st/i);
  });

  test('should submit user form with new values', async () => {
    const user = userEvent.setup();
    const newFullName = ' 1st';
    const newAbout = ' 1st';

    editFetchSpy.mockReturnValue({
      result: { updated_profile: { full_name: newFullName, about: newAbout } },
    });

    render(<Edit />);

    const fullName = screen.getByLabelText(/full name/i);
    const about = screen.getByLabelText(/about/i);

    await user.type(fullName, newFullName);
    await user.type(about, newAbout);

    const submit = await screen.findByRole('button');
    await user.click(submit);

    expect(fullName.value).toMatch(/foobar 1st/i);
    expect(about.value).toMatch(/first child 1st/i);
  });
});
