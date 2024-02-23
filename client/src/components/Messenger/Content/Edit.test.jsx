import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Edit from './Edit';
import * as useStatus from '../../../fetch/StatusAPI';
import * as EditFetch from '../../../fetch/EditAPI';

const useStatusSpy = vi.spyOn(useStatus, 'default');
const editFetchSpy = vi.spyOn(EditFetch, 'default');

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

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
      result: {
        profile: { full_name: 'foobar', about: 'first child', _id: '1001' },
      },
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

  test('should redirect to App if form submit without jwt', async () => {
    const user = userEvent.setup();

    editFetchSpy.mockReturnValue({
      error: 'missing token',
    });

    render(<Edit />);

    const fullName = screen.getByLabelText(/full name/i);
    const about = screen.getByLabelText(/about/i);

    await user.type(fullName, ' 1st');
    await user.type(about, ' 1st');

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const EditDiv = await screen.findByText(/redirected/i);

    expect(EditDiv.textContent).toMatch(/Redirected to \//i);
  });

  test('should redirect to App if form submit with invalid jwt', async () => {
    const user = userEvent.setup();

    editFetchSpy.mockReturnValue({
      error: 'missing token',
    });

    render(<Edit />);

    const fullName = screen.getByLabelText(/full name/i);
    const about = screen.getByLabelText(/about/i);

    await user.type(fullName, ' 1st');
    await user.type(about, ' 1st');

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const EditDiv = await screen.findByText(/redirected/i);

    expect(EditDiv.textContent).toMatch(/Redirected to \//i);
  });

  test('should render error page if form server error', async () => {
    const user = userEvent.setup();

    editFetchSpy.mockReturnValue({
      error: 'server error',
    });

    render(<Edit />);

    const fullName = screen.getByLabelText(/full name/i);
    const about = screen.getByLabelText(/about/i);

    await user.type(fullName, ' 1st');
    await user.type(about, ' 1st');

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const error = screen.getByTestId('error');

    expect(error).toBeInTheDocument();
  });

  test('should show form validation errors', async () => {
    const user = userEvent.setup();

    let stringOver150 = '';
    for (let i = 0; i < 15; i++) {
      stringOver150 = stringOver150 + 'ssssssssss';
    }

    editFetchSpy.mockReturnValue({
      formErrors: [{ msg: 'name error' }, { msg: 'about error' }],
    });

    render(<Edit />);

    const fullName = screen.getByLabelText(/full name/i);
    const about = screen.getByLabelText(/about/i);

    await user.clear(fullName);
    await user.clear(about);
    await user.type(about, stringOver150);

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const fullNameContainer = await screen.findByTestId('new_full_name');
    const newAboutContainer = await screen.findByTestId('new_about');
    const success = await screen.findByTestId('success');

    expect(fullNameContainer.textContent).toMatch(/name error/i);
    expect(newAboutContainer.textContent).toMatch(/about error/i);
    expect(success.textContent).not.toMatch(/profile successfully updated/i);
  });

  test('should submit user form with new values', async () => {
    const user = userEvent.setup();

    editFetchSpy.mockReturnValue({
      responseData: {
        updated_profile: { full_name: 'foobar 1st', about: 'first child 1st' },
      },
    });

    render(<Edit />);

    const fullName = screen.getByLabelText(/full name/i);
    const about = screen.getByLabelText(/about/i);

    await user.type(fullName, ' 1st');
    await user.type(about, ' 1st');

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const success = await screen.findByTestId('success');

    expect(editFetchSpy).toHaveBeenCalledWith({
      new_full_name: 'foobar 1st',
      new_about: 'first child 1st',
      profile_id: '1001',
    });
    expect(fullName.value).toMatch(/foobar 1st/i);
    expect(about.value).toMatch(/first child 1st/i);
    expect(success.textContent).toMatch(/profile successfully updated/i);
  });
});
