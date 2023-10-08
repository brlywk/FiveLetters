import { useCallback, useEffect, useReducer } from "react";

import { FetchError } from "./types/errorTypes.ts";
import { Action, State } from "./types/reducerTypes.ts";
import { LetterGuess } from "./types/wordTypes.ts";

import reducer, { getFullInitialState } from "./state/appReducer.ts";

import useLocalStorage from "./hooks/useLocalStorage";

import HowToPlay from "./components/HowToPlay.tsx";
import InputFields from "./components/InputFields";
import ResultView from "./components/ResultView.tsx";

// ---- App Component ---- //
const App = () => {
  // presisting played words
  const [playedWords, setPlayedWords] = useLocalStorage<string[]>(
    "playedWords",
    [],
  );

  // state
  const [state, dispatch]: [State, React.Dispatch<Action>] = useReducer(
    reducer,
    getFullInitialState(playedWords),
  );

  // other variables
  const numberOfTries = 3;

  // TODO: DEBUG
  if (state.gameOver) console.log("Game Over");
  if (state.playerWon) console.log("Player won");
  console.log(state.playedWords);

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

  const fetchData = useCallback(
    async (abortController: AbortController) => {
      // NOTE: The project is called 'FiveLetters', so a magic number is fine! Deal with it ;-)
      // The app is build in a way to support longer and shorter words though...
      const endpoint =
        "https://random-word-api.herokuapp.com/word?length=5&number=10";

      try {
        const result = await fetch(endpoint, {
          signal: abortController.signal,
        });

        if (!result.ok) {
          throw new FetchError("Network Error");
        }

        const data = (await result.json()) as string[];

        if (!Array.isArray(data) || data?.some((d) => typeof d !== "string")) {
          throw new TypeError("Unexpected data type");
        }

        if (data?.length > 0) {
          const unplayed = getUnplayedWords(data);

          // TODO: Not the best way, but if there are no possible words to play, go into error state
          // and delete all previously played words to make sure this state does not happen all
          // that often...
          if (unplayed.length === 0) {
            dispatch({
              type: "fullReset",
            });
          }

          dispatch({
            type: "setMysteryWord",
            payload:
              unplayed[
                Math.floor(Math.random() * unplayed.length)
              ].toUpperCase(),
          });
        }
      } catch (error) {
        // yeah should not both be handled here, but whatever!
        if (error instanceof FetchError || error instanceof TypeError) {
          dispatch({
            type: "setErrorState",
            payload: error.message,
          });
        }
      }
    },
    [getUnplayedWords],
  );

  // get the words
  useEffect(() => {
    const abortController = new AbortController();

    void fetchData(abortController);

    return () => abortController.abort();
  }, [getUnplayedWords, fetchData]);

  /**
   * Check how "correct" the current user guess is.
   *
   * State changed: "evaluatedGuess"
   * @param guess Current user guess as string array
   */
  const checkCurrentGuess = (guess: string[]) => {
    // first: we need to make sure every letter in guess is in eval array in correct order
    const evalGuess = new Array(guess.length) as [string, LetterGuess][];

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
      } else if (whereInWord.length <= 0) {
        // letter is either not found or has already been placed somewhere else, so this
        // instance of letter is to be considered wrong
        evalGuess[i] = [letter, "wrongLetter"];
      } else {
        // there is still a position in word left, so we must be at the wrong position
        evalGuess[i] = [letter, "wrongPosition"];
      }
    });

    // set as current guess
    dispatch({ type: "setCurrentGuess", payload: evalGuess });

    // TODO: do we check if the player guessed correctly here or somewhere else?
    if (guess.join("") === state.mysteryWord) {
      dispatch({ type: "playerWon" });
    }

    // TODO: Check if the player exceeded the maximum allowed tries
    if (state.playerGuesses.length + 1 >= numberOfTries) {
      dispatch({ type: "setGameOver" });
    }
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

        {/* Playing controls */}
        {!state.gameOver && !state.errorState && (
          <>
            <div className="flex flex-row items-center justify-between gap-2">
              <InputFields submitHandler={handleGuess} />
            </div>
            <ResultView
              playerGuesses={state.playerGuesses}
              numberOfTries={numberOfTries}
            />
          </>
        )}

        {/* Game Over */}
        {state.gameOver && (
          <div>
            Haha you lost
            <button onClick={() => dispatch({ type: "resetGame" })}>
              Restart
            </button>
          </div>
        )}

        {/* The least important thing... the player actually won :P */}
        {state.playerWon && <div>You won!</div>}
      </div>
    </>
  );
};

export default App;

// TODO: Restart needs to also refetch new words or check if another of the previously fetched words
// can be played
//
// TODO: ErrorState needs to be properly represented
//
// TODO: PlayerWon needs to be implemented
//
// TODO: playedWords needs to be properly persisted to local storage
//
// TODO: Maximum number of saved played words needs to be implemented
