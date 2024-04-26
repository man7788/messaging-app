import { render, screen } from '@testing-library/react';
import App from './App';
import * as useStatus from './fetch/messenger/useStatusAPI';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

const useStatusSpy = vi.spyOn(useStatus, 'default');

describe('App', () => {
  describe('render from useStatus result', () => {
    test('should render error page', () => {
      useStatusSpy.mockReturnValue({
        statusResult: null,
        statusLoading: false,
        statusError: true,
      });

      render(<App />);

      const errorDiv = screen.getByTestId('error');

      expect(errorDiv).toBeInTheDocument();
    });

    test('should render loading container', () => {
      useStatusSpy.mockReturnValue({
        statusResult: null,
        statusLoading: true,
        statusError: null,
      });

      render(<App />);

      const loadingDiv = screen.getByTestId('loading');

      expect(loadingDiv).toBeInTheDocument();
    });
  });
  describe('navigates from useStatus result', () => {
    test('to login page', () => {
      useStatusSpy.mockReturnValue({
        statusResult: { error: 'token error message' },
        statusLoading: false,
        statusError: null,
      });

      render(<App />);

      const AppDiv = screen.getByText(/redirected/i);

      expect(AppDiv.textContent).toMatch(/Redirected to \/login/i);
    });

    test('to chat page', () => {
      useStatusSpy.mockReturnValue({
        statusResult: { user: { _id: 'id placeholder' } },
        statusLoading: false,
        statusError: null,
      });

      render(<App />);

      const AppDiv = screen.getByText(/redirected/i);

      expect(AppDiv.textContent).toMatch(/Redirected to \/chat/i);
    });
  });
});
