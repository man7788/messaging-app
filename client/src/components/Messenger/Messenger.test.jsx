import { render, screen } from '@testing-library/react';
import Messenger from './Messenger';
import * as useStatus from '../../fetch/StatusAPI';

const useStatusSpy = vi.spyOn(useStatus, 'default');

describe('from useStatus result', () => {
  test('should render error page', async () => {
    useStatusSpy.mockReturnValue({
      result: null,
      loading: false,
      serverError: true,
    });

    render(<Messenger />);

    const errorDiv = screen.getByTestId('error');

    expect(errorDiv).toBeInTheDocument();
  });
});
