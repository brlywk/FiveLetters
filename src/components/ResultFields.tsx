import { EvaluatedGuess } from "../App";

interface ResultFieldProps {
  /** An evaluated guess, i.e. an array in which each letter has their "correctness" noted */
  evaluatedGuess: EvaluatedGuess;
}

// ---- ResultFields Component ---- //
const ResultFields = ({ evaluatedGuess }: ResultFieldProps) => {
  // these things we save values in...
  const correctColor = "bg-green-400/50";
  const semiCorrectColor = "bg-amber-400/50";
  const wrongColor = "bg-gray-300/20"; //"bg-red-400/50";

  // class coloring the background according to letter "correctness"
  const letterClass = evaluatedGuess?.map(([_, evaluation]) => {
    if (evaluation === "correctPosition") return correctColor;
    if (evaluation === "wrongPosition") return semiCorrectColor;
    if (evaluation === "wrongLetter") return wrongColor;
    return "";
  });

  // will it ever return?
  return (
    <div className="my-2 flex flex-row gap-2">
      {evaluatedGuess?.map(([letter, _], index) => (
        <input
          key={index}
          type="text"
          size={1}
          maxLength={1}
          value={letter}
          className={
            "black w-10 rounded-lg border border-black px-2 py-1 text-center shadow-md  backdrop-blur-md focus:outline-0 " +
            letterClass[index]
          }
          readOnly
        />
      ))}
    </div>
  );
};

export default ResultFields;
