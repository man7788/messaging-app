import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from './SignUp';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => `Redirected to ${to}`),
}));

describe('cancel button', () => {
  test('should navigate to login page', async () => {
    const user = userEvent.setup();

    render(<SignUp />);

    const cancel = screen.getByRole('button', { name: /cancel/i });

    await user.click(cancel);

    const SignUpDiv = screen.getByText(/redirected/i);
    screen.debug();
    expect(SignUpDiv.childNodes[1].textContent).toMatch(
      /Redirected to \/login/i,
    );
  });
});
