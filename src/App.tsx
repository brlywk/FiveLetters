import { useCallback, useEffect, useReducer } from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import InputFields from "./components/InputFields";
import ResultFields from "./components/ResultFields";
import HowToPlay from "./components/HowToPlay";
import ResultView from "./components/ResultView";

// Possible states of letters
export type LetterGuess = "wrongLetter" | "wrongPosition" | "correctPosition";
export type EvaluatedGuess = Array<[string, LetterGuess]>;

// let's try using a reducer for state management
type State = {
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
};

// allowed state change actions
type Action =
  | { type: "setNumberOfLetters"; payload: number }
  | { type: "setMysteryWord"; payload: string }
  | { type: "setCurrentGuess"; payload: EvaluatedGuess }
  | { type: "setPlayedWords"; payload: string[] }
  | { type: "increaseCurrentTry" }
  | { type: "resetGame" }
  | { type: "showHelp"; payload: boolean };

/**
 * Reducer function to update current state and return new state
 * @param state Current state
 * @param action Action to change state
 * @returns Updated state
 */
function reducer(state: State, action: Action): State {
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
      // TODO reset to initial state
      return {
        numberOfLetters: 5,
        mysteryWord: "",
        currentGuess: [] as EvaluatedGuess,
        playerGuesses: [] as EvaluatedGuess[],
        playedWords: state.playedWords, // should be fine as reset shouldn't happen before load of played words
        currentTry: 0,
        showHelp: false,
      };
    default:
      throw new Error("Unhandled action type");
  }
}

// ---- App Component ---- //
const App = () => {
  // presisting played words
  const [playedWords, setPlayedWords] = useLocalStorage<string[]>(
    "playedWords",
    [],
  );

  // state
  const [state, dispatch] = useReducer(reducer, {
    numberOfLetters: 5,
    mysteryWord: "",
    currentGuess: [] as EvaluatedGuess,
    playerGuesses: [] as EvaluatedGuess[],
    playedWords: playedWords,
    currentTry: 0,
    showHelp: false,
  });

  // other variables
  const numberOfTries = 6;
  const maxPlayedWordHistory = 3; // Todo: maybe 25?

  /**
   * Searches for a value in an array and returns all indices found
   * @param arr Array to search
   * @param value Value to search for in arr
   * @returns Array of all indices "value" is found at, or an empty array
   */
  const allIndicesOf = (arr: string[], value: string): number[] =>
    arr.reduce(
      (prev: number[], curr, i) => (curr === value ? [...prev, i] : prev),
      [],
    );

  /**
   * Checks array of still possible words against already played words and returns
   * an array with still playable words
   * @param possibleWords Array of words still "in play"
   */
  const getUnplayedWords = useCallback(
    (possibleWords: string[]) => {
      if (!possibleWords || possibleWords.length === 0) return [];

      return possibleWords.filter((item) => !playedWords.includes(item));
    },
    [playedWords],
  );

  // get the words
  useEffect(() => {
    const endpoint = "http://localhost:3000/words";

    // fetch(endpoint)
    //   .then((result) => {
    //     if (!result.ok) throw new Error(`Unable to reach server: ${endpoint}`);

    //     return result.json();
    //   })
    //   .then((data: string[]) => {
    //     if (data && data.length > 0) {
    //       const unplayed = getUnplayedWords(data);

    //       if (unplayed.length === 0) {
    //         dispatch({ type: "setMysteryWord", payload: "" });
    //       }
    //       dispatch({
    //         type: "setMysteryWord",
    //         payload:
    //           unplayed[
    //             Math.floor(Math.random() * unplayed.length)
    //           ].toUpperCase(),
    //       });
    //     } else {
    //       dispatch({ type: "setMysteryWord", payload: "" });
    //     }
    //   })
    //   .catch((error: Error) => console.log(error.message));

    // TODO just for debug
    dispatch({ type: "setMysteryWord", payload: "HALLO" });
  }, [getUnplayedWords]);

  /**
   * Check how "correct" the current user guess is.
   *
   * State changed: "evaluatedGuess"
   * @param guess Current user guess as string array
   */
  const checkCurrentGuess = (guess: string[]) => {
    // first: we need to make sure every letter in guess is in eval array in correct order
    const evalGuess: [string, LetterGuess][] = new Array(guess.length);

    // we need to check how "correct" the guess is
    guess.forEach(([letter], i) => {
      const whereInWord = allIndicesOf(state.mysteryWord.split(""), letter);
      const whereInGuess = allIndicesOf(guess, letter);

      if (whereInWord.includes(i) || whereInWord.length > 0) {
        // same position
        if (i === whereInWord[whereInWord.indexOf(i)]) {
          evalGuess[i] = [letter, "correctPosition"];

          // pop value so later letters don't overlap
          whereInWord.splice(whereInWord.indexOf(i), 1);
        } else {
          // pop out wrong position and check if there is still a guess left that could be
          // either correct or still at the wrong position, if so this is considered an incorrect letter
          whereInGuess.pop();

          if (whereInGuess.length >= whereInWord.length) {
            evalGuess[i] = [letter, "wrongLetter"];
          } else {
            evalGuess[i] = [letter, "wrongPosition"];
          }
        }
      } else if (whereInWord.length > 0) {
        // there is still a position in word left, so we must be at the wrong position
        evalGuess[i] = [letter, "wrongPosition"];
      } else {
        // letter is either not found or has already been placed somewhere else, so this
        // instance of letter is to be considered wrong
        evalGuess[i] = [letter, "wrongLetter"];
      }
    });

    // set as current guess
    dispatch({ type: "setCurrentGuess", payload: evalGuess });
  };

  /**
   * Handles a new player guess being submitted
   * @param guess Guess made by player
   */
  const handleGuess = (guess: string[]) => {
    // check guess + add to all guesses
    checkCurrentGuess(guess);

    // update number of guesses
    dispatch({ type: "increaseCurrentTry" });

    // add to played words
  };

  const handleHowToPlayClose = () => {
    dispatch({ type: "showHelp", payload: false });
  };

  // the infamous rendering thing-a-majig
  return (
    <>
      <HowToPlay
        showHelp={state.showHelp}
        numberOfLetters={state.numberOfLetters}
        numberOfTries={numberOfTries}
        onClose={handleHowToPlayClose}
      />
      <div className="container mx-auto grid justify-center p-2 lg:p-0">
        {/* How to play */}
        <div className="my-4 flex justify-center md:fixed md:left-4 md:top-4 md:my-0">
          <button
            onClick={() => dispatch({ type: "showHelp", payload: true })}
            className="w-2/3 rounded-lg border border-black/25 bg-gray-300/40 p-2 shadow-lg transition duration-200 ease-in-out hover:border-black/0  hover:bg-black/25 md:w-[15vw]"
          >
            How to play
          </button>
        </div>

        {/* Main stuff */}
        <h1 className="my-4 mb-4 text-4xl font-light drop-shadow-2xl lg:my-10">
          Letter Game
        </h1>
        {/* TODO: delete after debug */}
        <div className="my-10">Word: {state.mysteryWord}</div>
        <div className="flex flex-row items-center justify-between gap-2">
          <InputFields submitHandler={handleGuess} />
        </div>
        <ResultView
          playerGuesses={state.playerGuesses}
          numberOfTries={numberOfTries}
        />
      </div>
    </>
  );
};

export default App;
