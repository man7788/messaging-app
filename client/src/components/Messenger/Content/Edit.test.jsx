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
});
