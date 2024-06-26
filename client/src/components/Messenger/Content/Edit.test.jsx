import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Edit from './Edit';
import * as useStatus from '../../../fetch/messenger/useStatusAPI';
import * as EditFetch from '../../../fetch/messenger/EditAPI';

afterEach(() => {
  vi.clearAllMocks();
});

const useStatusSpy = vi.spyOn(useStatus, 'default');
const editFetchSpy = vi.spyOn(EditFetch, 'default');

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

describe('from useStatus result', () => {
  test('should render error page', async () => {
    useStatusSpy.mockReturnValue({
      statusResult: null,
      statusLoading: false,
      statusError: true,
    });

    render(<Edit />);

    const error = screen.getByTestId('error');

    expect(error).toBeInTheDocument();
  });

  test('should render loading page', async () => {
    useStatusSpy.mockReturnValue({
      statusResult: null,
      statusLoading: true,
      statusError: null,
    });

    render(<Edit />);

    const loading = screen.getByTestId('loading');

    expect(loading).toBeInTheDocument();
  });

  test('should show profile data in form inputs', async () => {
    useStatusSpy.mockReturnValue({
      statusResult: {
        user: { profile: { full_name: 'foobar', about: 'first child' } },
      },
      statusLoading: false,
      statusError: null,
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
      statusResult: {
        user: {
          profile: { full_name: 'foobar', about: 'first child', _id: '1001' },
        },
      },
      statusLoading: false,
      statusError: null,
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

    editFetchSpy.mockReturnValueOnce({
      responseData: {
        errors: [{ msg: 'name error' }, { msg: 'about error' }],
      },
    });

    render(<Edit />);

    const fullName = screen.getByLabelText(/full name/i);
    const about = screen.getByLabelText(/about/i);
    expect(fullName.parentNode.className).toMatch('');
    expect(about.parentNode.className).toMatch('');

    await user.clear(fullName);
    await user.clear(about);
    await user.type(about, stringOver150);

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const fullNameContainer = await screen.findByTestId('new_full_name');
    const newAboutContainer = await screen.findByTestId('new_about');
    const success = await screen.findByTestId('success');

    expect(fullNameContainer.childNodes[1].className).toMatch(/inputoutline/i);
    expect(newAboutContainer.childNodes[1].className).toMatch(/inputoutline/i);
    expect(fullNameContainer.textContent).toMatch(/name error/i);
    expect(newAboutContainer.textContent).toMatch(/about error/i);
    expect(success.textContent).not.toMatch(/profile successfully updated/i);
  });

  test('should reset form validation errors', async () => {
    const user = userEvent.setup();

    let stringOver150 = '';
    for (let i = 0; i < 15; i++) {
      stringOver150 = stringOver150 + 'ssssssssss';
    }

    editFetchSpy.mockReturnValueOnce({
      responseData: {
        errors: [{ msg: 'name error' }, { msg: 'about error' }],
      },
    });

    render(<Edit />);

    const fullName = screen.getByLabelText(/full name/i);
    const about = screen.getByLabelText(/about/i);
    expect(fullName.parentNode.className).toMatch('');
    expect(about.parentNode.className).toMatch('');

    await user.clear(fullName);
    await user.clear(about);
    await user.type(about, stringOver150);

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const fullNameContainer = await screen.findByTestId('new_full_name');
    const newAboutContainer = await screen.findByTestId('new_about');
    const success = await screen.findByTestId('success');

    expect(fullNameContainer.childNodes[1].className).toMatch(/inputoutline/i);
    expect(newAboutContainer.childNodes[1].className).toMatch(/inputoutline/i);
    expect(fullNameContainer.textContent).toMatch(/name error/i);
    expect(newAboutContainer.textContent).toMatch(/about error/i);
    expect(success.textContent).not.toMatch(/profile successfully updated/i);

    await user.type(fullName, 'some strings');
    await user.type(about, 'some strings');

    expect(fullNameContainer.childNodes[1].className).toMatch('');
    expect(newAboutContainer.childNodes[1].className).toMatch('');
    expect(fullNameContainer.textContent).toMatch('');
    expect(newAboutContainer.textContent).toMatch('');
  });

  test('should disable submit button if input values remain the same', async () => {
    const user = userEvent.setup();

    editFetchSpy.mockReturnValue({});

    render(<Edit />);

    const submit = await screen.findByRole('button');
    expect(submit.parentNode.className).toMatch(/savebtndefault/i);

    await user.click(submit);
    expect(editFetchSpy).not.toHaveBeenCalled();

    const fullName = screen.getByLabelText(/full name/i);
    await user.type(fullName, 'some new strings');
    expect(submit.parentNode.className).toMatch(/savebtnactive/i);

    await user.click(submit);
    expect(editFetchSpy).toHaveBeenCalled();
  });

  test('should show loading after clicking submit button', async () => {
    const user = userEvent.setup();

    editFetchSpy.mockReturnValue({});

    render(<Edit />);

    const fullName = screen.getByLabelText(/full name/i);
    const about = screen.getByLabelText(/about/i);

    await user.type(fullName, ' 1st');
    await user.type(about, ' 1st');

    const submit = await screen.findByRole('button');
    await user.click(submit);

    const loading = await screen.findByTestId('edit-loading');

    expect(loading).toBeInTheDocument;
  });

  test('should submit user form with new values', async () => {
    const user = userEvent.setup();

    editFetchSpy.mockReturnValue({
      responseData: {
        updatedProfile: { full_name: 'foobar 1st', about: 'first child 1st' },
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
