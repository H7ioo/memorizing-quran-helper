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

const data = [{ chapter: 0, name: "Al-Fatiha", pages: [1, 2], length: 36 }];

export function Game() {
  const [gameIsActive, setGameIsActive] = useState(false);
  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)]">
      <main className={cn("flex-1 flex flex-col gap-2 items-center justify-center mx-auto w-full")}>
        {gameIsActive ?
          <>
            <Button className="w-[200px]">Start</Button>
            <div className="flex flex-col gap-1">
              <Combobox title="Select Content" options={[{ label: "Test", value: "test" }]} />
              <Combobox title="Select Question" options={[{ label: "Test", value: "test" }]} />
            </div>
            <div>Top Plays</div>
          </>
          :
          <div className="bg-slate-900 rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-card-foreground">Question</h2>
            <div className="grid grid-cols-1 gap-4">
              {data.map(question =>
                <button
                  className={`bg-card rounded-lg shadow-lg p-4 transition-colors ${1 === 0 ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                >
                  {question.name}
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-4 text-muted-foreground">
              <div>Score: </div>
              <div>Time: s</div>
            </div>
          </div>
        }
      </main>
    </div>
  )
}

