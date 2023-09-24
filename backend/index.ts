import express, { Express, Request, Response } from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import axios from "axios";

export interface Player {
  id: string;
  playerName: string;
  score: number;
  deckId: string;
}

export enum outCome {
  "Win",
  "Lose",
  "Tie",
}

export interface CardValues {
  [key: string]: number;
}
export interface Card {
  code: string;
  image: string;
  images: {
    svg: string;
    png: string;
  };
  value: string;
  suit: string;
}

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
interface SPlayer {
  socketid: string;
  player: Player;
}
var player1: SPlayer;
var player2: SPlayer;
var waitingPlayers: SPlayer[] = [];
io.on("connection", (socket) => {
  // store player and socket
  //  wait for 2 players to join
  socket.on("create-game", ({ socketid, player }) => {
    if (waitingPlayers.length === 0) {
      waitingPlayers.push({ socketid, player });
    } else {
      player1 = waitingPlayers[0];
      player2 = { socketid, player };
      waitingPlayers = [];
    }
  });
  socket.on(
    "draw-card",
    async (
      { amountOfCards, player }: { amountOfCards: string; player: Player },
      callback
    ) => {
      // TODO: check if deck is empty
      // TODO: Break out into separate function
      const cards = await axios.get(
        `https://deckofcardsapi.com/api/deck/${player.deckId}/draw/?count=${amountOfCards}`
      );

      const cardValues: CardValues = {
        ACE: 1,
        KING: 13,
        QUEEN: 12,
        JACK: 11,
        "10": 10,
        "9": 9,
        "8": 8,
        "7": 7,
        "6": 6,
        "5": 5,
        "4": 4,
        "3": 3,
        "2": 2,
      };

      const cardsDrawn = cards.data.cards;
      const cardsDrawnValues: number[] = cardsDrawn.map(
        (card: Card) => cardValues[card.value]
      );
      const cardImages = cardsDrawn.map((card: Card) => card.image);
      const score = cardsDrawnValues.reduce((a, b) => a + b, 0);
      player.score += score;
      if (player1.socketid === socket.id) {
        player1.player = player;
      }
      if (player2.socketid === socket.id) {
        player2.player = player;
      }
      callback({ player, cardImages });
    }
  );

  socket.on("compare-hands", (callback) => {
    let winner: Player | undefined;
    if (player1.player.score > player2.player.score) {
      winner = player1.player;
    } else if (player1.player.score < player2.player.score) {
      winner = player2.player;
    } else {
      winner = undefined;
    }
    if (winner === undefined) {
      callback({ winner: "its a tie" });
    } else {
      callback({ winner: winner.playerName });
    }
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/startgame", (req: Request, res: Response) => {
  const getDeck = async () => {
    const deck = await axios.get(
      "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
    );
    const deckId = deck.data.deck_id;
    return deckId;
  };
  return res.send({ deckId: getDeck() });
});

server.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:8000`);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT. Closing server...");
  process.exit(0);
});
