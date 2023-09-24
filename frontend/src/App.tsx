import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { Router, useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

export interface Player {
  id: string;
  playerName: string;
  score: number;
  deckId: string;
}

export interface AppProps {
  socketRef: Socket;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
}
function App({ socketRef, player, setPlayer }: AppProps) {
  const [playerName, setPlayerName] = useState<string>("");
  const navigate = useNavigate();
  // TODO: unique id for each player
  // Different deckids are okay for each player
  // optimize this function
  const getDeckId = async () => {
    const deck = await axios.get(
      "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
    );
    return deck.data.deck_id;
  };

  return (
    <div className="text-center h-screen justify-center">
      <h1 className="text-3xl">Card War</h1>
      <h2>
        Rules: Each player draws 5 cards, the lowest is ace and the highest is a
        king, the player who has the highest cards wins
      </h2>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const updatedPlayer: Player = { ...player };
          updatedPlayer.playerName = playerName;
          updatedPlayer.deckId = await getDeckId();
          updatedPlayer.id = socketRef.id;

          setPlayer(updatedPlayer);
          socketRef.emit("create-game", {
            socketid: socketRef.id,
            player: updatedPlayer,
          });
          navigate("/startgame");
        }}
      >
        <label>Enter your name</label>
        <input onChange={(event) => setPlayerName(event.target.value)}></input>
        <button type="submit">Start Game</button>
      </form>
    </div>
  );
}

export default App;
