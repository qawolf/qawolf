import Debug from 'debug';
import WebSocket from 'ws';

const debug = Debug('qawolf/test:CDPSession');

export class CDPSession {
  static async connect(
    wsEndpoint: string,
    targetId: string,
  ): Promise<CDPSession> {
    debug('connect: %s %s', wsEndpoint, targetId);
    const session = new CDPSession(wsEndpoint);
    await session._connected;
    await session._connectToTarget(targetId);
    return session;
  }

  _connected: Promise<void>;
  _id = 1;
  _sessionId: string;
  _ws: WebSocket;

  constructor(wsEndpoint: string) {
    this._ws = new WebSocket(wsEndpoint, { perMessageDeflate: false });
    this._connected = new Promise((resolve) => this._ws.once('open', resolve));
  }

  async _connectToTarget(targetId: string): Promise<void> {
    const data = await this.send({
      method: 'Target.attachToTarget',
      params: {
        targetId,
        flatten: true,
      },
    });

    this._sessionId = data.result.sessionId;
    debug('attached to target with sessionId: %s', this._sessionId);
  }

  send(data: any): Promise<any> {
    const message = { ...data, id: this._id++ };
    if (this._sessionId) message.sessionId = this._sessionId;

    debug('send: %s', JSON.stringify(message));

    this._ws.send(JSON.stringify(message));

    return new Promise((resolve) => {
      const listener = (text: string): void => {
        const response = JSON.parse(text);
        if (response.id === message.id) {
          debug('received: %s', message.id, text);
          this._ws.removeListener('message', listener);
          resolve(response);
        }
      };

      this._ws.on('message', listener);
    });
  }
}
