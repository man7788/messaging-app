import { render, screen } from '@testing-library/react';
import Edit from './Edit';
import * as useStatus from '../../../fetch/StatusAPI';

const useStatusSpy = vi.spyOn(useStatus, 'default');

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
