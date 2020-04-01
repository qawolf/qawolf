/* eslint-disable */
declare module 'mitm' {
  import { Socket } from 'net';

  export type MitmType = {
    on: (event: string, callback: (socket: Socket) => Socket) => void;
    disable: () => void;
  };

  function Mitm(): MitmType;

  export default Mitm;
}
