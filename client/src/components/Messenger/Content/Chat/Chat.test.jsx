import { render, screen, act, waitFor } from '@testing-library/react';
import Chat from './Chat';
import { chatContext } from '../../../../contexts/chatContext';
import * as SendFetch from '../../../../fetch/ChatAPI';
import * as messagesFetch from '../../../../fetch/MessageAPI';

afterEach(() => {
  vi.clearAllMocks();
});

const chatProfile = {
  about: 'First Child',
  full_name: 'Foobar',
  user_id: '1001',
  _id: '1',
};

const messages = [
  {
    author: '1001',
    chat: 'chat0001',
    date_med: 'Feb 1, 2024',
    text: 'Foobar to John Doe Feb 1',
    time_simple: '7:51 AM',
    _id: 'chatid0001',
  },
  {
    author: '9999',
    chat: 'chat0001',
    date_med: 'Feb 1, 2024',
    text: 'John Doe to Foobar Feb 1',
    time_simple: '8:51 AM',
    _id: 'chatid0002',
  },
  {
    author: '1001',
    chat: 'chat0001',
    date_med: 'Feb 11, 2024',
    text: 'Foobar to John Doe Feb 11',
    time_simple: '9:32 PM',
    _id: 'chatid0003',
  },
  {
    author: '9999',
    chat: 'chat0001',
    date_med: 'Feb 11, 2024',
    text: 'John Doe to Foobar Feb 11',
    time_simple: '10:32 PM',
    _id: 'chatid0004',
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
      <chatContext.Provider value={{}}>
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

describe('when click on user to chat', () => {
  test('should render chat error with selected user name', async () => {
    messagesFetchSpy.mockReturnValue({ error: true });

    render(
      <chatContext.Provider value={{ chatProfile }}>
        <Chat />
      </chatContext.Provider>,
    );
    await waitFor(async () => {
      expect(messagesFetchSpy).toHaveBeenCalledTimes(1);
    });

    const user = await screen.findByTestId('chat-title');
    const error = await screen.findByTestId('error');

    expect(user.textContent).toMatch(/foobar/i);
    expect(error).toBeInTheDocument;
  });

  test('should render chat loading with selected user name', async () => {
    messagesFetchSpy.mockReturnValue({ messages: null });

    render(
      <chatContext.Provider value={{ chatProfile }}>
        <Chat />
      </chatContext.Provider>,
    );

    const user = screen.getByTestId('chat-title');
    const loading = screen.getByTestId('loading');

    expect(user.textContent).toMatch(/foobar/i);
    expect(loading).toBeInTheDocument;

    await waitFor(async () => {
      expect(messagesFetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  test('should show there is no message when no conversation is found', async () => {
    messagesFetchSpy.mockReturnValue({ messages: null });

    render(
      <chatContext.Provider value={{ chatProfile }}>
        <Chat />
      </chatContext.Provider>,
    );

    const user = screen.getByTestId('chat-title');
    const noMessage = await screen.findByTestId('no-message');
    const input = screen.getByTestId('input');

    expect(user.textContent).toMatch(/foobar/i);
    expect(noMessage).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  test('should show messages in conversation area', async () => {
    messagesFetchSpy.mockReturnValue({ messages });
    window.HTMLElement.prototype.scrollIntoView = function () {};

    render(
      <chatContext.Provider value={{ chatProfile }}>
        <Chat loginId={'9999'} />
      </chatContext.Provider>,
    );

    const user = screen.getByTestId('chat-title');
    const messageContainers = await screen.findAllByTestId('date');
    const input = screen.getByTestId('input');

    const date1 = messageContainers[0].childNodes[0];
    const date2 = messageContainers[1].childNodes[0];

    const textContainer1 = messageContainers[0].childNodes[1].childNodes[0];
    const textContainer2 = messageContainers[0].childNodes[2].childNodes[0];
    const textContainer3 = messageContainers[1].childNodes[1].childNodes[0];
    const textContainer4 = messageContainers[1].childNodes[2].childNodes[0];

    const text1 = textContainer1.childNodes[0].childNodes[0];
    const text2 = textContainer2.childNodes[0].childNodes[0];
    const text3 = textContainer3.childNodes[0].childNodes[0];
    const text4 = textContainer4.childNodes[0].childNodes[0];

    const time1 = textContainer1.childNodes[0].childNodes[1];
    const time2 = textContainer2.childNodes[0].childNodes[1];
    const time3 = textContainer3.childNodes[0].childNodes[1];
    const time4 = textContainer4.childNodes[0].childNodes[1];

    expect(user.textContent).toMatch(/foobar/i);

    expect(date1.textContent).toMatch(/Feb 1, 2024/i);
    expect(date2.textContent).toMatch(/Feb 11, 2024/i);

    expect(textContainer1.classList[0]).toMatch(/received/i);
    expect(textContainer2.classList[0]).toMatch(/sent/i);
    expect(textContainer3.classList[0]).toMatch(/received/i);
    expect(textContainer4.classList[0]).toMatch(/sent/i);

    expect(text1.textContent).toMatch(/Foobar to John Doe Feb 1/i);
    expect(text2.textContent).toMatch(/John Doe to Foobar Feb 1/i);
    expect(text3.textContent).toMatch(/Foobar to John Doe Feb 11/i);
    expect(text4.textContent).toMatch(/John Doe to Foobar Feb 11/i);

    expect(time1.textContent).toMatch(/7:51 AM/i);
    expect(time2.textContent).toMatch(/8:51 AM/i);
    expect(time3.textContent).toMatch(/9:32 PM/i);
    expect(time4.textContent).toMatch(/10:32 PM/i);

    expect(input).toBeInTheDocument();
  });
});
