import { BrowserRouter, Routes, Route } from "react-router-dom";
import App, { Player } from "./App";
import Game from "./Game";
import { useContext, useRef, useState } from "react";
import socketIO, { Socket } from "socket.io-client";

const Render = () => {
  const socketRef = useRef(socketIO("http://localhost:8000").connect()).current;
  const [player, setPlayer] = useState<Player>({
    id: "",
    playerName: "",
    score: 0,
    deckId: "",
  });
  socketRef.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <App socketRef={socketRef} player={player} setPlayer={setPlayer} />
          }
        />
        <Route
          path="/startgame"
          element={
            <Game socketRef={socketRef} player={player} setPlayer={setPlayer} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Render;
