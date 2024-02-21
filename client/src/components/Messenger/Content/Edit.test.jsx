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
});
