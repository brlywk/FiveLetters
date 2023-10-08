import { KeyboardEvent, useEffect, useRef, useState } from "react";

// Well well well TypeScript, here we go again
interface InputFieldsProps {
  /** Number of fields to provide */
  numberOfFields?: number;
  /** Callback being called when player submits a guess */
  submitHandler: (word: string[]) => void;
}

// ---- InputFields Component ---- //
const InputFields = ({
  numberOfFields = 5,
  submitHandler,
}: InputFieldsProps) => {
  // state and all that
  const initialArray = new Array(numberOfFields).fill("");
  const [letters, setLetters] = useState<string[]>(initialArray);

  // We use this ref to move between input fields
  const inputRef = useRef<Map<number, HTMLInputElement>>();

  /**
   * Gets currently inputRef Map (or creates a new Map that's assigned to inputRef.current)
   * @returns Map assigned to inputRef.current
   */
  const getMap = () => {
    // If nothing is set, create a new map
    if (!inputRef.current) inputRef.current = new Map();
    // otherwise return existing map
    return inputRef.current;
  };

  /**
   * Clears the values of all input fields stored in inputRef map
   */
  const clearFields = () => {
    if (!inputRef.current) return;

    const keys = inputRef.current.keys();

    for (const key of keys) {
      const field = inputRef.current.get(key)!;
      field.value = "";
    }

    // also set focus to first field for good measure
    inputRef.current.get(0)?.focus();
  };

  /**
   * Check's if guess is valid and calls submitHandler provided with props
   */
  const handleSubmit = () => {
    if (letters.some((letter) => !letter)) return;
    submitHandler(letters);
    clearFields();
  };

  /**
   * Handles keyboard events for input fields, including moving between fields
   * @param event KeyboardEvent
   * @param index Identifiying index of the input field that fired the event
   */
  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    // NOTE: It is possible to enter ^^ (as ^ needs to check the next char to see if it's a valid letter, e.g "â")
    // NOTE: This "breaks" auto-focus, but it will still not allow submitting the value

    // nope out if field can't be identified
    if (!inputRef.current || !inputRef.current.has(index)) return;

    // variables
    const field = inputRef.current.get(index)!;
    const hasPrev = index > 0;
    const hasNext = index < inputRef.current.size - 1;
    const isLetter = /^[a-zA-Z]$/.test(event.key);
    const isDelete = event.key === "Backspace" || event.key === "Delete";
    const isEnter = event.key === "Enter";
    const isNextKey = event.key === "ArrowRight" || event.key === "Tab";
    const isPrevKey =
      event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey);
    const isEscape = event.key === "Escape";
    const controlKeys =
      isDelete || isEnter || isNextKey || isPrevKey || isEscape;

    // update state
    const updateLetters = (value: string) => {
      setLetters((prev) => {
        const newArr = [...prev];
        newArr[index] = value;
        return newArr;
      });
    };

    // prevent non-letter input
    if (!isLetter && !controlKeys) {
      event.preventDefault();
      return;
    }

    // delete on backspace, set letter otherwise
    if (isDelete) {
      if (!hasPrev && field.value === "") return;
      field.value = "";
      updateLetters("");
      if (hasPrev) inputRef.current.get(index - 1)?.focus();
    } else if (isLetter) {
      const letter = event.key.toUpperCase();
      field.value = letter;
      updateLetters(letter);
      inputRef.current.get(index + 1)?.focus();
    }

    // navigate, blur or submit
    if (isLetter || controlKeys) {
      if (hasNext && isNextKey) inputRef.current.get(index + 1)?.focus();
      if (hasPrev && isPrevKey) inputRef.current.get(index - 1)?.focus();
      if (isEscape) field.blur();
      if (isEnter) {
        handleSubmit();
        if (!hasNext) field.blur();
      }
      event.preventDefault();
    }
  };

  // useEffect to set focus on field when site is loaded
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.get(0)?.focus();
    }
  }, []);

  // legend has it that this return masterfully paints elaborate... stuff
  return (
    <div className="my-2 flex flex-row gap-2">
      {initialArray.map((_, index) => (
        <input
          key={index}
          type="text"
          size={1}
          maxLength={1}
          ref={(field) => {
            const map = getMap();
            if (field) {
              map.set(index, field);
            } else {
              map.delete(index);
            }
          }}
          className="black h-[3rem] w-[3rem] rounded-lg border border-black/50 bg-white/50 p-2 text-center text-2xl shadow-md backdrop-blur-md transition duration-200 ease-in-out focus:border-black focus:bg-white focus:outline-0 md:h-[4rem] md:w-[4rem] md:text-4xl"
          onKeyDown={(event) => handleKeyDown(event, index)}
        />
      ))}
    </div>
  );
};

export default InputFields;
