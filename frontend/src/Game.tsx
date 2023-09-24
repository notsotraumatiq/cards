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
    <div className="flex-col justify-center text-center h-screen">
      <h1 className="text-xl"> Hi {player?.playerName} Draw a card</h1>
      <button
        disabled={cardImages.length != 0}
        onClick={() => drawCard("5", player)}
      >
        Draw
      </button>
      <h2 className="text-base"> Here are your cards and </h2>
      <div className="flex gap-7 h-36">
        {cardImages.map((cardImage) => (
          <img key={cardImage} src={cardImage} alt="card" />
        ))}
      </div>
      <h3 className="text-base">Your score is {player?.score}</h3>
      <button
        onClick={() => {
          // listen to the compare-hand event
          socketRef.emit("compare-hands", (winner: string | Player) => {
            console.log(winner);
            if (winner === undefined) alert("It's a tie");
            else if (winner === socketRef.id) alert("You win");
            else alert("You lose");
          });
        }}
      >
        Compare Score
      </button>
    </div>
  );
};

export default Game;
