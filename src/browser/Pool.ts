import { BrowserObject } from "webdriverio";
import { createBrowser } from "./browserUtils";
import { Connection } from "./Connection";
import { createConnection } from "./createConnection";
import { logger } from "../logger";
import { Server } from "./Server";
import { difference } from "lodash";

type ConstructorArgs = {
  server: Server;
  url: string;
};

export class Pool {
  private _browser: BrowserObject;
  private _closed: boolean = false;
  // public for tests
  public _connections: Connection[] = [];
  private _server: Server;
  private _url: string;

  constructor({ server, url }: ConstructorArgs) {
    this._server = server;
    this._url = url;
  }

  public get browser() {
    return this._browser;
  }

  public async create() {
    this._browser = await createBrowser(this._url);
    // create initial connection
    await this.getConnection();
  }

  public async close(): Promise<void> {
    if (this._closed) return;
    this._closed = true;

    const handles = await this._browser.getWindowHandles();
    for (let handle of handles) {
      await this._browser.switchToWindow(handle);
      await this._browser.closeWindow();
    }
  }

  public async getConnection(index: number = 0): Promise<Connection> {
    if (index < this._connections.length) return this._connections[index];
    if (index === this._connections.length) {
      return this._createMissingWindowConnection();
    }

    throw new Error("Unexpected connection index");
  }

  private async _createMissingWindowConnection() {
    const id = this._connections.length.toString();
    logger.debug(`Pool: createMissingWindowConnection ${id}`);

    const handles = await this._browser.getWindowHandles();
    const missingHandles = difference(
      handles,
      this._connections.map(c => c.windowHandle)
    );

    if (missingHandles.length !== 1) {
      throw new Error(
        `${missingHandles.length} missing connections. Must equal 1`
      );
    }

    const connection = await createConnection({
      id,
      browser: this._browser,
      server: this._server,
      windowHandle: missingHandles[0]
    });

    connection._socket.once("disconnect", (reason: string) =>
      this._replaceConnection(reason, connection)
    );

    this._connections.push(connection);

    return connection;
  }

  private async _replaceConnection(reason: string, connection: Connection) {
    if (this._closed) return;

    logger.debug(
      `Pool: reconnecting disconnected Connection ${connection.id} "${reason}"`
    );

    const replacement = await createConnection({
      id: connection.id,
      browser: this._browser,
      server: this._server,
      windowHandle: connection.windowHandle
    });

    replacement._requestId = connection._requestId;

    this._connections[Number(connection.id)] = replacement;

    if (connection._inflight) {
      logger.debug(
        `Pool: resending ${JSON.stringify(connection._inflight.request)}`
      );
      replacement._inflight = connection._inflight;
      replacement._socket.emit("request", connection._inflight.request);
    }
  }
}
