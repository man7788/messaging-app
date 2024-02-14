import { render, screen } from '@testing-library/react';
import Login from './Login';
import * as useStatus from '../fetch/StatusAPI';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

const useStatusSpy = vi.spyOn(useStatus, 'default');

describe('Login', () => {
  describe('render from useStatus result', () => {
    test('should render error page', async () => {
      useStatusSpy.mockReturnValue({
        result: null,
        loading: false,
        serverError: true,
      });

      render(<Login />);

      const errorDiv = screen.getByTestId('error');

      expect(errorDiv).toBeInTheDocument();
    });

    test('should render loading page', async () => {
      useStatusSpy.mockReturnValue({
        result: null,
        loading: true,
        serverError: null,
      });

      render(<Login />);

      const loadingDiv = screen.getByTestId('loading');

      expect(loadingDiv).toBeInTheDocument();
    });

    test('should render login page', async () => {
      useStatusSpy.mockReturnValue({
        result: { error: 'token error message' },
        loading: false,
        serverError: null,
      });

      render(<Login />);

      const login = screen.getByRole('button', { name: /log in/i });

      expect(login).toBeInTheDocument();
    });
  });
});
