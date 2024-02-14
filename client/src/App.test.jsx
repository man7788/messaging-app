import { render, screen } from '@testing-library/react';
import App from './App';
import * as useStatus from './fetch/StatusAPI';

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
        result: null,
        loading: false,
        serverError: true,
      });

      render(<App />);

      const errorDiv = screen.getByTestId('error');

      expect(errorDiv).toBeInTheDocument();
    });
    test('should render loading container', () => {
      useStatusSpy.mockReturnValue({
        result: null,
        loading: true,
        serverError: null,
      });

      render(<App />);

      const loadingDiv = screen.getByTestId('loading');

      expect(loadingDiv).toBeInTheDocument();
    });
  });
  describe('navigates from useStatus result', () => {
    test('to login page', () => {
      useStatusSpy.mockReturnValue({
        result: { error: 'token error message' },
        loading: false,
        serverError: null,
      });

      render(<App />);

      const AppDiv = screen.getByText(/redirected/i);

      expect(AppDiv.textContent).toMatch(/Redirected to \/login/i);
    });

    test('to chat page', () => {
      useStatusSpy.mockReturnValue({
        result: { user: { _id: 'id placeholder' } },
        loading: false,
        serverError: null,
      });

      render(<App />);

      const AppDiv = screen.getByText(/redirected/i);

      expect(AppDiv.textContent).toMatch(/Redirected to \/chat/i);
    });
  });
});
