/**
 * v0 by Vercel.
 * @see https://v0.dev/t/ykpMBuW9IW4
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button";
import { Combobox } from "./combobox";
import { cn } from "@/lib/utils";
import CHAPTERS from "@/data/chapters-en.json"
const GAME_MODES = [{ label: "Input", value: "input" }, { label: "Select", value: "select" }] as const;
const QUESTION_TYPES = [{ label: "Chapter Name", value: "ChapterName" }, { label: "Chapter Number", value: "chapterNumber" }, { label: "Chapter Pages", value: "chapterPages" }] as const;
type GameModes = (typeof GAME_MODES)[number]["value"];
type QuestionTypes = (typeof QUESTION_TYPES)[number]["value"];

export function Game() {
  const [gameIsActive, setGameIsActive] = useState(false);
  const [gameMode, setGameMode] = useState<GameModes | "">("");
  const [questionType, setQuestionType] = useState<QuestionTypes | "">("");
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)]">
      <main className={cn("flex-1 flex flex-col gap-2 items-center justify-center mx-auto w-full")}>
        {!gameIsActive ?
          <>
            <Button className="w-[200px]" disabled={gameMode === "" || questionType === ""} onClick={() => setGameIsActive(true)}>Start</Button>
            <div className="flex flex-col gap-1">
              <Combobox title="Select Questions Type" options={QUESTION_TYPES} value={questionType} setValue={setQuestionType} />
              <Combobox title="Select Mode" options={GAME_MODES} value={gameMode} setValue={setGameMode} />
            </div>
            <div>Top Plays</div>
          </>
          :
          <div className="bg-slate-900 rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-card-foreground">What is Chapter {CHAPTERS.slice(0, 3)[0]?.id}'s Name?</h2>
            <div className="grid grid-cols-1 gap-4">
              {CHAPTERS.slice(0, 3).map(chapter =>
                <button
                  key={chapter.id}
                  className={`bg-card rounded-lg shadow-lg p-4 transition-colors ${1 === 0 ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                >
                  {chapter.name}
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-4 text-muted-foreground">
              <div>Score: </div>
              <div>Time: </div>
            </div>
          </div>
        }
      </main>
    </div>
  )
}

