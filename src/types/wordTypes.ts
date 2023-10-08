// Possible states of letters
export type LetterGuess = "wrongLetter" | "wrongPosition" | "correctPosition";
export type EvaluatedGuess = [string, LetterGuess][];
