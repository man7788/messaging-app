import { render, screen } from '@testing-library/react';
import Messenger from './Messenger';
import * as useStatus from '../../fetch/StatusAPI';

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

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

  test('should render loading page', () => {
    useStatusSpy.mockReturnValue({
      result: null,
      loading: true,
      serverError: null,
    });

    render(<Messenger />);

    const loadingDiv = screen.getByTestId('loading');

    expect(loadingDiv).toBeInTheDocument();
  });

  test('should navigate to App page', async () => {
    useStatusSpy.mockReturnValue({
      result: { error: 'token error message' },
      loading: false,
      serverError: null,
    });

    render(<Messenger />);

    const MessengerDiv = screen.getByText(/redirected/i);

    expect(MessengerDiv.textContent).toMatch(/Redirected to \//i);
  });
});
