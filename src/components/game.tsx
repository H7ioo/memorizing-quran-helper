import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Combobox } from "./combobox";
import { cn } from "@/lib/utils";
import CHAPTERS from "@/data/chapters-en.json";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";

type Chapter = {
  chapterName: string;
  chapterNumber: number;
  versesNumber: number;
};

type GameContextType = {
  originalChapters: Chapter[];
  defaultChapters: Chapter[];
  setDefaultChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  questionType: QuestionTypes | null;
  setQuestionType: React.Dispatch<React.SetStateAction<QuestionTypes | null>>;
  answerType: QuestionTypes | null;
  setAnswerType: React.Dispatch<React.SetStateAction<QuestionTypes | null>>;
  gameMode: GameModes | null;
  setGameMode: React.Dispatch<React.SetStateAction<GameModes | null>>;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  results: {
    question: string;
    correctAnswer: string;
    playerAnswer: string;
  }[];
  setResults: React.Dispatch<
    React.SetStateAction<
      {
        question: string;
        correctAnswer: string;
        playerAnswer: string;
      }[]
    >
  >;
  startGame: () => void;
  resetGame: () => void;
};

// TODO: instead of shuffling in each question use a queue
// const [questionQueue, setQuestionQueue] = useState(
//   shuffle(Array.from(Array(chapters.length).keys()))
// );

// const nextQuestion = () => {
//   const nextIndex = questionQueue.pop();
//   setCurrentIndex(nextIndex);
//   setQuestionQueue(questionQueue);
// };

// TODO: useLocalStorage hook
// const useChapterPreferences = () => {
//   const getPreferences = useCallback(() => {
//     return JSON.parse(localStorage.getItem("chaptersPreferences") || "[]");
//   }, []);

//   const setPreferences = useCallback((preferences) => {
//     localStorage.setItem("chaptersPreferences", JSON.stringify(preferences));
//   }, []);

//   return { getPreferences, setPreferences };
// };

// TODO: Combine state
// const [gameConfig, setGameConfig] = useState({
//   gameMode: null,
//   questionType: null,
//   answerType: null,
// });

// const updateGameConfig = (newConfig) => {
//   setGameConfig((prev) => ({ ...prev, ...newConfig }));
// };

// TODO: if issue with table performance use react-window or tan virtualized

// TODO: remove all assertions and handle errors or use assert

// TODO: export comp lazy and suspense

// TODO: Quit button

// TODO: Leader board

// TODO: Apply changes button is annoying I have to scroll to the end

// TODO: Extract logic into hooks

// Context Setup
const GameContext = createContext<GameContextType | null>(null);

function useGameContext() {
  return useContext(GameContext)!;
}

const GAME_MODES = [
  { label: "Input", value: "input" },
  { label: "Select", value: "select" },
] as const;

const QUESTION_TYPES = [
  { label: "Chapter Name", value: "chapterName" },
  { label: "Chapter Number", value: "chapterNumber" },
  { label: "Verses Number", value: "versesNumber" },
] as const;

type GameModes = (typeof GAME_MODES)[number]["value"];
type QuestionTypes = (typeof QUESTION_TYPES)[number]["value"];

enum GameState {
  Menu = "menu",
  Playing = "playing",
  Done = "done",
}

export function GameMenu() {
  const originalChapters = CHAPTERS.map((chapter) => ({
    chapterName: chapter.name,
    chapterNumber: chapter.id,
    versesNumber: chapter.total_verses,
  }));

  const [defaultChapters, setDefaultChapters] = useState(originalChapters);
  const [chapters, setChapters] = useState(defaultChapters);
  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [questionType, setQuestionType] = useState<QuestionTypes | null>(null);
  const [answerType, setAnswerType] = useState<QuestionTypes | null>(null);
  const [gameMode, setGameMode] = useState<GameModes | null>(null);
  const [score, setScore] = useState<number>(0);
  const [results, setResults] = useState<
    { question: string; correctAnswer: string; playerAnswer: string }[]
  >([]);

  useEffect(() => {
    const preferences = localStorage.getItem("chaptersPreferences");
    if (preferences) {
      const chapterNumbers: number[] = JSON.parse(preferences);
      setDefaultChapters(
        originalChapters.filter((chapter) =>
          chapterNumbers.includes(chapter.chapterNumber),
        ),
      );
    }
  }, []);

  useEffect(() => {
    setChapters(defaultChapters);
  }, [defaultChapters]);

  const startGame = () => {
    if (gameMode && questionType && answerType) {
      setGameState(GameState.Playing);
      setScore(0);
      setResults([]);
    }
  };

  const resetGame = () => {
    setGameState(GameState.Menu);
    setChapters(defaultChapters);
    setScore(0);
    setResults([]);
  };

  return (
    <GameContext.Provider
      value={{
        originalChapters,
        defaultChapters,
        setDefaultChapters,
        chapters,
        setChapters,
        gameState,
        setGameState,
        questionType,
        setQuestionType,
        answerType,
        setAnswerType,
        gameMode,
        setGameMode,
        score,
        setScore,
        results,
        setResults,
        startGame,
        resetGame,
      }}
    >
      <div className="flex min-h-[calc(100vh-56px)] flex-col">
        <main className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-2">
          {gameState === GameState.Menu && <GameSetup />}
          {gameState === GameState.Playing && <Game />}
          {gameState === GameState.Done && <GameOver />}
        </main>
      </div>
    </GameContext.Provider>
  );
}

function GameSetup() {
  const {
    questionType,
    setQuestionType,
    answerType,
    setAnswerType,
    gameMode,
    setGameMode,
    startGame,
    defaultChapters,
  } = useGameContext();

  return (
    <>
      <div className="flex flex-col gap-2">
        <Combobox
          title="Select Question Type"
          options={QUESTION_TYPES.filter((q) => q.value !== answerType)}
          value={questionType}
          setValue={setQuestionType}
        />
        <Combobox
          title="Select Answer Type"
          options={QUESTION_TYPES.filter((q) => q.value !== questionType)}
          value={answerType}
          setValue={setAnswerType}
        />
        <Combobox
          title="Select Game Mode"
          options={GAME_MODES}
          value={gameMode}
          setValue={setGameMode}
        />
      </div>
      <Button
        className="w-[200px]"
        disabled={
          !gameMode ||
          !questionType ||
          !answerType ||
          defaultChapters.length < 3
        }
        onClick={startGame}
      >
        Start
      </Button>
      <div className="line h-0.5 w-[200px] bg-white"></div>
      <MemoizedChapterSelection />
      {defaultChapters.length < 3 && (
        <span className="text-xs text-red-600">
          You should select at least 3 chapters to start the game
        </span>
      )}
    </>
  );
}

export function ChapterSelection() {
  const { originalChapters, setDefaultChapters } = useContext(GameContext)!;
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);

  useEffect(() => {
    const preferences = localStorage.getItem("chaptersPreferences");
    if (preferences) {
      setSelectedChapters(JSON.parse(preferences));
    } else {
      setSelectedChapters(
        originalChapters.map((chapter) => chapter.chapterNumber),
      );
    }
  }, [originalChapters]);

  const handleCheckboxChange = useCallback((chapterNumber: number) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterNumber)
        ? prev.filter((number) => number !== chapterNumber)
        : [...prev, chapterNumber],
    );
  }, []);

  const handleJuzClick = (juz: number, isChecked: boolean) => {
    if (isChecked) {
      const chapterIds = CHAPTERS.filter((chapter) => chapter.juz === juz).map(
        (chapter) => chapter.id,
      );
      setSelectedChapters((prev) => [...prev, ...chapterIds]);
    } else {
      const chapterIds = CHAPTERS.filter(
        (chapter) =>
          selectedChapters.includes(chapter.id) && chapter.juz !== juz,
      ).map((chapter) => chapter.id);
      setSelectedChapters(chapterIds);
    }
  };

  const applyChanges = useCallback(() => {
    localStorage.setItem(
      "chaptersPreferences",
      JSON.stringify(selectedChapters),
    );
    setDefaultChapters(
      originalChapters.filter((chapter) =>
        selectedChapters.includes(chapter.chapterNumber),
      ),
    );
    toast("Chapters changed successfully", { duration: 1500 });
  }, [selectedChapters, originalChapters, setDefaultChapters]);

  const selectAll = useCallback(() => {
    setSelectedChapters(
      originalChapters.map((chapter) => chapter.chapterNumber),
    );
  }, [originalChapters]);

  const deselectAll = useCallback(() => {
    setSelectedChapters([]);
  }, []);

  const juzArray = useMemo(
    () => Array.from({ length: 30 }, (_, i) => i + 1),
    [],
  ); // Remove 2&5. Juz because it is empty. Nevermind
  const chapterGroups = useMemo(() => {
    return juzArray.map((juz) => ({
      juz,
      chapters: CHAPTERS.filter((chapter) => chapter.juz === juz),
    }));
  }, [juzArray]);

  return (
    <div className="w-[200px]">
      <div className="mb-2 flex justify-between gap-1">
        <Button onClick={selectAll} variant="outline">
          Select All
        </Button>
        <Button onClick={deselectAll} variant="outline">
          Deselect All
        </Button>
      </div>
      <div className="max-h-[350px] overflow-y-auto rounded border p-4">
        {chapterGroups.map(({ juz, chapters }) => {
          return (
            <>
              <div
                className="my-2 flex items-center space-x-2 first-of-type:mt-0"
                key={juz}
              >
                <Checkbox
                  className="h-8 w-8 transition"
                  disabled={chapters.length === 0}
                  id={`juz-${juz}`}
                  checked={
                    chapters.length !== 0 &&
                    chapters.every((chapter) =>
                      selectedChapters.includes(chapter.id),
                    )
                  }
                  onCheckedChange={(isChecked) =>
                    handleJuzClick(juz, isChecked as boolean)
                  }
                />{" "}
                {/*TODO: as boolean*/}
                <label
                  htmlFor={`juz-${juz}`}
                  className={cn("text-md cursor-pointer font-medium", {
                    "cursor-not-allowed line-through": chapters.length === 0,
                  })}
                >
                  الجزء {juz}
                </label>
              </div>
              {chapters.map((chapter) => (
                <div
                  className="ml-8 mt-1 flex items-center space-x-2"
                  key={chapter.id}
                >
                  <Checkbox
                    className="h-6 w-6 transition"
                    id={`chapter-${chapter.id}`}
                    checked={selectedChapters.includes(chapter.id)}
                    onCheckedChange={() => handleCheckboxChange(chapter.id)}
                  />
                  <label
                    htmlFor={`chapter-${chapter.id}`}
                    className="text-md cursor-pointer font-medium"
                  >
                    {chapter.name}
                  </label>
                </div>
              ))}
            </>
          );
        })}
      </div>
      <Button onClick={applyChanges} variant="outline" className="mt-2 w-full">
        Apply Changes
      </Button>
    </div>
  );
}

export const MemoizedChapterSelection = memo(ChapterSelection);

function Game() {
  const {
    chapters,
    setChapters,
    questionType,
    answerType,
    gameMode,
    setGameState,
    score,
    setScore,
    results,
    setResults,
    defaultChapters,
  } = useGameContext();

  const [currentIndex, setCurrentIndex] = useState<number>(
    Math.floor(Math.random() * chapters.length),
  );
  const [playerAnswer, setPlayerAnswer] = useState<string>("");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const totalQuestions = defaultChapters.length;

  const currentQuestion = chapters[currentIndex];

  const inputRef = useRef<HTMLInputElement | null>(null);

  const createOptions = useCallback(
    (correctAnswer: string) => {
      const incorrectAnswers: string[] = [];
      // Generate two unique incorrect answers
      while (incorrectAnswers.length < 2) {
        const randomIndex = Math.floor(Math.random() * defaultChapters.length);
        const randomAnswer =
          defaultChapters![randomIndex]![answerType!].toString();
        // Ensure it's not the correct answer and not already included
        if (
          randomAnswer !== correctAnswer &&
          !incorrectAnswers.includes(randomAnswer)
        ) {
          incorrectAnswers.push(randomAnswer);
        }
      }
      // Combine and shuffle answers
      const options = [correctAnswer, ...incorrectAnswers];
      return options.sort(() => Math.random() - 0.5);
    },
    [defaultChapters, answerType],
  );

  // Memoize the options so that they are not recalculated on every render
  const options = useMemo(() => {
    const correctAnswer = currentQuestion![answerType!].toString();
    return createOptions(correctAnswer);
  }, [currentQuestion, createOptions, answerType]);

  const nextQuestion = useCallback(() => {
    if (chapters.length === 0) {
      setGameState(GameState.Done);
      return; // Early return if there are no questions left
    }

    const currentQuestion = chapters[currentIndex];
    if (!currentQuestion) {
      console.error("Current question is undefined."); // Error handling
      return; // Safety check to avoid errors
    }

    const correctAnswer = currentQuestion![answerType!].toString();

    const newResults = [
      ...results,
      {
        question: String(currentQuestion![questionType!]),
        correctAnswer,
        playerAnswer:
          gameMode === "select" ? selectedAnswer || "" : playerAnswer,
      },
    ];

    setResults(newResults);

    if (gameMode === "select") {
      if (selectedAnswer === correctAnswer) {
        setScore((prevScore) => prevScore + 1);
      }
    } else {
      if (playerAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        setScore((prevScore) => prevScore + 1);
      }
    }

    const newChapters = chapters.filter((_, idx) => idx !== currentIndex);
    setChapters(newChapters);

    if (newChapters.length > 0) {
      const newIndex = Math.floor(Math.random() * newChapters.length);
      setCurrentIndex(newIndex);
    } else {
      setGameState(GameState.Done);
    }

    // If inputRef exists (which means game mode is input) focus on it
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setPlayerAnswer("");
    setSelectedAnswer(null);
  }, [
    chapters,
    currentIndex,
    playerAnswer,
    selectedAnswer,
    questionType,
    answerType,
    results,
    setGameState,
    setScore,
    setResults,
  ]);

  const questionLabel = QUESTION_TYPES.find(
    (q) => q.value === questionType,
  )?.label;
  const answerLabel = QUESTION_TYPES.find((q) => q.value === answerType)?.label;

  return (
    <div className="w-full max-w-md rounded-lg bg-slate-900 p-8 shadow-lg">
      <div className="text-center">
        <div>{questionLabel}</div>
        <div className="block pb-3 text-3xl">
          {currentQuestion![questionType!]}
        </div>
      </div>

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => e.preventDefault()}
      >
        {gameMode === "input" ? (
          <Input
            ref={inputRef}
            type={
              answerType === "chapterNumber" || answerType === "versesNumber"
                ? "number"
                : "text"
            }
            value={playerAnswer}
            onChange={(e) => setPlayerAnswer(e.target.value)}
            placeholder={`Your answer for ${answerLabel?.toLowerCase()}`}
            autoFocus
          />
        ) : (
          <>
            {options.map((option, index) => (
              <Button
                variant="secondary"
                key={index}
                className={cn(
                  {
                    "border-transparent bg-green-500":
                      selectedAnswer === option,
                  },
                  "hover:bg-green-500",
                )}
                onClick={() => setSelectedAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </>
        )}

        <Button onClick={nextQuestion} className="w-full">
          Next
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between text-muted-foreground">
        <div>
          Score: {score}/{totalQuestions} {/* Display score out of total */}
        </div>
        <div>Remaining Questions: {chapters.length}</div>
      </div>
    </div>
  );
}

function GameOver() {
  const { resetGame, results, score, defaultChapters } = useGameContext();
  const totalQuestions = defaultChapters.length; // Use originalChapters for total

  return (
    <div className="w-full max-w-md space-y-4 rounded-lg bg-slate-900 p-8 text-center shadow-lg">
      <h2 className="pb-2 text-2xl">Game Over</h2>
      <div className="pb-2 text-xl">
        Your final score: {score}/{totalQuestions} {/* Show final score */}
      </div>

      <div className="mt-4 text-left">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">Question</th>
              <th className="border px-4 py-2">Correct Answer</th>
              <th className="border px-4 py-2">Your Answer</th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ question, correctAnswer, playerAnswer }, idx) => (
              <tr
                key={idx}
                className={cn(
                  "border px-4 py-2",
                  playerAnswer === correctAnswer
                    ? "bg-green-100 text-green-900"
                    : "bg-red-100 text-red-900",
                )}
              >
                <td className="border px-4 py-2">{question}</td>
                <td className="border px-4 py-2">{correctAnswer}</td>
                <td className="border px-4 py-2">{playerAnswer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button onClick={resetGame} className="w-full">
        Play Again
      </Button>
    </div>
  );
}
