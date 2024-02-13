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
  describe('navigates from useStatus result', () => {
    test('to login page', async () => {
      useStatusSpy.mockReturnValue({
        result: { error: 'token error message' },
        loading: false,
        serverError: false,
      });

      render(<App />);

      const AppDiv = screen.getByText(/redirected/i);

      expect(AppDiv.textContent).toMatch(/Redirected to \/login/i);
    });

    test('to chat page', async () => {
      useStatusSpy.mockReturnValue({
        result: { user: { _id: 'id placeholder' } },
        loading: false,
        serverError: false,
      });

      render(<App />);

      const AppDiv = screen.getByText(/redirected/i);

      expect(AppDiv.textContent).toMatch(/Redirected to \/chat/i);
    });
  });
});
