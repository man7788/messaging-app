import { render, screen, act, waitFor } from '@testing-library/react';
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
    await waitFor(async () => {
      expect(messagesFetchSpy).toHaveBeenCalledTimes(1);
    });

    const error = await screen.findByTestId('error');

    expect(error).toBeInTheDocument;
  });

  test('should render loading page', async () => {
    messagesFetchSpy.mockReturnValue({ messages: null });

    render(
      <chatContext.Provider value={{ chatProfile }}>
        <Chat />
      </chatContext.Provider>,
    );

    const loading = await screen.findByTestId('loading');
    expect(loading).toBeInTheDocument;
  });

  test('should show no chat selected', async () => {
    messagesFetchSpy.mockReturnValue({ messages: null });

    render(
      <chatContext.Provider value={{}}>
        <Chat />
      </chatContext.Provider>,
    );

    await waitFor(async () => {
      expect(messagesFetchSpy).toHaveBeenCalledTimes(1);
    });

    const noChat = await screen.findByTestId('no-chat');

    expect(noChat).toBeInTheDocument();
  });
});
