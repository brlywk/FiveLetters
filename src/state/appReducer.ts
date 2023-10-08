import { Action, State } from "../types/reducerTypes";
import { EvaluatedGuess } from "../types/wordTypes";

/** Helper to make sure we always get a proper full reset */
export function getFullInitialState(playedWords: string[] = []): State {
  return {
    numberOfLetters: 5,
    mysteryWord: "",
    currentGuess: [] as EvaluatedGuess,
    playerGuesses: [] as EvaluatedGuess[],
    playedWords,
    currentTry: 0,
    showHelp: false,
    playerWon: false,
    errorState: null,
    gameOver: false,
  };
}

/**
 * Reducer function to update current state and return new state
 * @param state Current state
 * @param action Action to change state
 * @returns Updated state
 */
export default function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setNumberOfLetters":
      return { ...state, numberOfLetters: action.payload };
    case "setMysteryWord":
      return { ...state, mysteryWord: action.payload };
    case "setCurrentGuess":
      return {
        ...state,
        currentGuess: action.payload,
        playerGuesses: [...state.playerGuesses, action.payload],
      };
    case "setPlayedWords":
      return { ...state, playedWords: action.payload };
    case "increaseCurrentTry":
      return { ...state, currentTry: state.currentTry + 1 };
    case "showHelp":
      return { ...state, showHelp: action.payload };
    case "resetGame":
      return getFullInitialState(state.playedWords);
    case "playerWon":
      return {
        ...state,
        playerWon: true,
        playedWords: [...state.playedWords, state.mysteryWord],
      };
    case "setErrorState":
      return { ...state, errorState: action.payload };
    case "fullReset":
      return getFullInitialState();
    case "setGameOver":
      return {
        ...state,
        gameOver: true,
        playedWords: [...state.playedWords, state.mysteryWord],
      };

    default:
      throw new Error("Unhandled action type");
  }
}
