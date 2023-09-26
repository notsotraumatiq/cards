import { useEffect, useState } from "react";
import { Player } from "./App";
import { Socket } from "socket.io-client";

export interface GameProps {
  socketRef: Socket;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
}

const Game = ({ socketRef, player, setPlayer }: GameProps) => {
  // Draw 5 cards
  const [cardImages, setCardImages] = useState<string[]>([]);
  const drawCard = async (amountOfCards: string, player: Player) => {
    socketRef.emit(
      "draw-card",
      { amountOfCards, player },
      ({ player, cardImages }: { player: Player; cardImages: string[] }) => {
        console.log(player);
        setPlayer(player);
        setCardImages(cardImages);
      }
    );
  };

  return (
    <div className="flex justify-center items-center h-screen text-center">
      <div>
        <h1 className="text-xl">
          Hello! {player?.playerName}. Click on Draw to draw 5 cards
        </h1>
        <button
          className="rounded-md bg-slate-700 py-1 px-2 text-white"
          disabled={cardImages.length != 0}
          onClick={() => drawCard("5", player)}
        >
          Draw
        </button>

        <div className="flex gap-7 h-36 my-2">
          {cardImages.length > 0
            ? cardImages.map((cardImage) => (
                <img key={cardImage} src={cardImage} alt="card" />
              ))
            : null}
        </div>
        <h3 className="text-base">Your score is {player?.score}</h3>
        <button
          className="rounded-md bg-slate-700 py-1 px-2 mx-2 text-white"
          onClick={() => {
            // listen to the compare-hand event
            socketRef.emit("compare-hands", (winner: string) => {
              console.log(winner);
              if (winner === "It's a tie") alert("It's a tie");
              else if (winner === socketRef.id) alert("You win");
              else alert("You lose");
            });
          }}
        >
          Compare Score
        </button>
      </div>
    </div>
  );
};

export default Game;
