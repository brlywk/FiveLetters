import { useState } from "react";

/**
 * Hook to handle retreival from and updates to localStorage
 * @param key localStorage key to use
 * @param initialValue Initial value that localStorage for key should be set to
 * @returns Tuple with value and setter for key
 */
const useLocalStorage = <T,>(
  key: string,
  initialValue: T,
): [T, (newValue: T) => void] => {
  // initial state needs to check if anything is already present for our key,
  // and if so, return it parsed; if not, we set it to our initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
        return initialValue;
      } else {
        throw error;
      }
    }
  });

  // setting a new value for our key
  const setValue = (value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        throw error;
      }
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
