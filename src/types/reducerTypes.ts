import { EvaluatedGuess } from "./wordTypes";

// let's try using a reducer for state management
export interface State {
  /** Number of letters in word */
  numberOfLetters: number;
  /** The word to be guessed */
  mysteryWord: string;
  /** Current guess by player */
  currentGuess: EvaluatedGuess;
  /** All guesses by player so far */
  playerGuesses: EvaluatedGuess[];
  /** Words player already played in the past */
  playedWords: string[];
  /** Which try is the player currently on? */
  currentTry: number;
  /** Show help dialog */
  showHelp: boolean;
  /** Whether or not the player has won */
  playerWon: boolean;
  /** Error state, should contain the error message if an error happens */
  errorState: string | null;
  /** Player lost hehe */
  gameOver: boolean;
}

// allowed state change actions
export type Action =
  | { type: "setNumberOfLetters"; payload: number }
  | { type: "setMysteryWord"; payload: string }
  | { type: "setCurrentGuess"; payload: EvaluatedGuess }
  | { type: "setPlayedWords"; payload: string[] }
  | { type: "increaseCurrentTry" }
  | { type: "resetGame" }
  | { type: "showHelp"; payload: boolean }
  | { type: "playerWon" }
  | { type: "setErrorState"; payload: string | null }
  | { type: "fullReset" }
  | { type: "setGameOver" };
