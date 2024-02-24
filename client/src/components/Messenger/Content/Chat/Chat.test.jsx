import { render, screen } from '@testing-library/react';
import Chat from './Chat';
import { chatContext } from '../../../../contexts/chatContext';
import * as SendFetch from '../../../../fetch/ChatAPI';
import * as messagesFetch from '../../../../fetch/MessageAPI';

afterEach(() => {
  vi.clearAllMocks();
});

const chatProfile = [
  {
    about: 'First Child',
    full_name: 'Foobar',
    user_id: '1001',
    _id: '1',
  },
];

const messagesFetchSpy = vi.spyOn(messagesFetch, 'default');
const SendFetchSpy = vi.spyOn(SendFetch, 'default');

describe('from messagesFetch result', () => {
  test('should render error page', async () => {
    messagesFetchSpy.mockReturnValue({ error: true });

    render(
      <chatContext.Provider value={{}}>
        <Chat />
      </chatContext.Provider>,
    );

    const error = await screen.findByTestId('error');

    expect(error).toBeInTheDocument;
  });
});
