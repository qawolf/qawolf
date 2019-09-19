import io from "socket.io-client";
import * as actions from "./actions";
import { Executor } from "./Executor";

const qawolf = {
  actions,
  Executor,
  io
};

if (typeof window !== "undefined") {
  (window as any).qawolf = qawolf;
  console.log("loaded qawolf");

  const socket: any = io("http://localhost:3000", {
    transports: ["websocket"]
  });

  socket.on("connect", () => {
    console.log("CONNECTED ON CLIENT");
  });
}

export default qawolf;
