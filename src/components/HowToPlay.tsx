import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

type HowToPlayProps = {
  showHelp: boolean;
  numberOfLetters: number;
  numberOfTries: number;
  onClose: () => void;
};

const HowToPlay = ({
  showHelp,
  numberOfLetters,
  numberOfTries,
  onClose,
}: HowToPlayProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(showHelp);
  }, [showHelp]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="absolute z-[9999]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Backgrop */}
          <div className="fixed inset-0 bg-gray-300/10 backdrop-blur" />
        </Transition.Child>

        {/* Dialog itself */}
        <div className="fixed inset-0 overflow-y-auto text-sm">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform divide-y overflow-hidden rounded-2xl border border-black/10 bg-white/25 text-left align-middle shadow-xl backdrop-blur transition-all">
                <Dialog.Title
                  as="h3"
                  className="p-4 text-lg font-bold text-gray-900"
                >
                  How to play
                </Dialog.Title>

                <div className="p-4">
                  <div>
                    The game will randomly select a {numberOfLetters} letters
                    word.
                  </div>
                  <hr className="mx-28 my-4" />
                  <div>
                    You can type your guess in the fields above, and press{" "}
                    <span className="m-1 rounded border border-black/20 bg-black/10 px-1 font-mono">
                      Enter
                    </span>{" "}
                    to submit your guess.
                  </div>
                  <hr className="mx-28 my-4" />

                  <div>
                    You have a total of {numberOfTries} tries to guess the
                    correct word.
                  </div>
                  <hr className="mx-28 my-4" />

                  <div className="grid gap-y-4">
                    After every try, you will see information on how close you
                    got to the correct word:
                    <div className="grid grid-cols-[max-content_auto] items-center gap-4">
                      <div className="h-4 w-4 rounded border border-black bg-green-300"></div>
                      <div>This letter is in the right position.</div>
                      <div className="h-4 w-4 rounded border border-black bg-amber-300"></div>
                      <div>
                        This letter is in the word, but at the wrong position.
                      </div>
                      <div className="h-4 w-4 rounded border border-black bg-gray-300"></div>
                      <div>This letter is not in the word.</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end p-2">
                  <button
                    type="button"
                    className="rounded-lg border border-black/25 bg-gray-300/40 p-2 transition duration-200 ease-in-out  hover:border-black/0 hover:bg-black/25"
                    onClick={handleClose}
                  >
                    Got it, thanks!
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default HowToPlay;
