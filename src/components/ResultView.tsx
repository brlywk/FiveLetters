import { EvaluatedGuess } from "../App";
import ResultFields from "./ResultFields";

type ResultViewProps = {
  playerGuesses: EvaluatedGuess[];
  numberOfTries: number;
};

const ResultView = ({ playerGuesses, numberOfTries }: ResultViewProps) => {
  return (
    <>
      {playerGuesses &&
        playerGuesses.map((guess, index) => (
          <div key={index} className="flex items-center justify-between">
            <ResultFields evaluatedGuess={guess} />
            <div className="flex min-w-[4rem] justify-end">
              {index + 1} / {numberOfTries}
            </div>
          </div>
        ))}
    </>
  );
};

export default ResultView;
