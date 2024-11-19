import { useState } from "react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Repeat,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Label } from "./ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
("use client");

import React, { useCallback } from "react";

export function AudioPlayerPage() {
  // const [file, setFile] = useState<File>();
  const [mediaURL, setMediaURL] = useState<string>("");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileBlob = window.URL.createObjectURL(file);
      setMediaURL(fileBlob);
    }
  };

  return (
    <div className="container py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-2">
        <div>
          <Label htmlFor="media">Audio File</Label>
          <Input
            id="media"
            type="file"
            accept="audio/*,video/*"
            onChange={onFileChange}
          />
        </div>
        {mediaURL ? <AudioPlayer src={mediaURL} /> : "No file selected yet!"}
      </div>
    </div>
  );
}

export default function AudioPlayer({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const startOTPRef = useRef<HTMLInputElement>(null);
  const endOTPRef = useRef<HTMLInputElement>(null);

  const formatTime = useCallback((time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const getOTPTimeValue = useCallback(
    (time: number) => {
      return formatTime(time).replace(/:/g, "");
    },
    [formatTime],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
      setEndTime(audio.duration);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    const handleEnded = () => {
      if (loop) {
        audio.currentTime = startTime;
        audio.play();
      } else {
        setIsPlaying(false);
      }
    };

    const checkBoundary = () => {
      if (audio.currentTime >= endTime) {
        if (loop) {
          audio.currentTime = startTime;
        } else {
          audio.pause();
          setIsPlaying(false);
        }
      }
    };

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", checkBoundary);

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", checkBoundary);
    };
  }, [loop, startTime, endTime]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume === 0 ? 1 : 0;
      setVolume(volume === 0 ? 1 : 0);
    }
  }, [volume]);

  const handleVolumeChange = useCallback((newValue: number[]) => {
    const newVolume = newValue[0]!;
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  }, []);

  const handleSeek = useCallback((newValue: number[]) => {
    const newTime = newValue[0]!;
    setCurrentTime(newTime);
    if (audioRef.current) audioRef.current.currentTime = newTime;
  }, []);

  const toggleLoop = useCallback(() => setLoop((prev) => !prev), []);

  const moveAudio = useCallback(
    (seconds: number) => {
      if (audioRef.current) {
        const newTime = Math.max(
          0,
          Math.min(audioRef.current.currentTime + seconds, duration),
        );
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [duration],
  );

  const isOTPDisabled = useCallback(
    (group: "hours" | "minutes" | "seconds") => {
      const time = {
        hours: Math.floor(duration / 3600),
        minutes: Math.floor((duration % 3600) / 60),
        seconds: Math.floor(duration % 60),
      };
      return time[group] < 1;
    },
    [duration],
  );

  const convertOTPValueToSeconds = useCallback(
    (value: string) => {
      const valueWithPadding = value.padStart(6, "0");
      const hours = !isOTPDisabled("hours")
        ? parseInt(valueWithPadding.slice(0, 2))
        : 0;
      const minutes = !isOTPDisabled("minutes")
        ? parseInt(valueWithPadding.slice(2, 4))
        : 0;
      const seconds = !isOTPDisabled("seconds")
        ? parseInt(valueWithPadding.slice(4, 6))
        : 0;
      return hours * 3600 + minutes * 60 + seconds;
    },
    [isOTPDisabled],
  );

  const handleTimeChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
      (value: string) => {
        const timeInSeconds = convertOTPValueToSeconds(value);
        setter(timeInSeconds);
      },
    [convertOTPValueToSeconds],
  );

  return (
    <Card className={cn("w-full max-w-xl", className)}>
      <audio ref={audioRef} src={src} />
      <CardContent className="p-6">
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="mt-2 flex justify-between">
          <span className="self-end text-sm text-muted-foreground">
            {formatTime(currentTime)}
          </span>
          <div className="flex items-end justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveAudio(-5)}
              className="h-8 w-8"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Backward 5 seconds</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              className="h-12 w-12"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
              <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveAudio(5)}
              className="h-8 w-8"
            >
              <RotateCw className="h-4 w-4" />
              <span className="sr-only">Forward 5 seconds</span>
            </Button>
          </div>
          <span className="self-end text-sm text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex w-full items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8 shrink-0"
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              <span className="sr-only">
                {volume === 0 ? "Unmute" : "Mute"}
              </span>
            </Button>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-full"
            />
            <Button
              variant={loop ? "secondary" : "ghost"}
              size="icon"
              onClick={toggleLoop}
              className="h-8 w-8 shrink-0"
            >
              <Repeat className="h-4 w-4" />
              <span className="sr-only">
                {loop ? "Disable loop" : "Enable loop"}
              </span>
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {[
            {
              type: "start",
              time: startTime,
              setter: setStartTime,
              ref: startOTPRef,
            },
            { type: "end", time: endTime, setter: setEndTime, ref: endOTPRef },
          ].map(({ type, time, setter, ref }) => (
            <div
              key={type}
              className="flex flex-col items-center gap-2 md:flex-row md:items-end"
            >
              <div>
                <Label htmlFor={`${type}-time`}>
                  {type === "start" ? "Start" : "End"} Time
                </Label>
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={getOTPTimeValue(time)}
                  onChange={handleTimeChange(setter)}
                  ref={ref}
                >
                  {["hours", "minutes", "seconds"].map((group, groupIndex) => (
                    <React.Fragment key={group}>
                      {groupIndex > 0 && ":"}
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={groupIndex * 2}
                          disabled={isOTPDisabled(
                            group as "hours" | "minutes" | "seconds",
                          )}
                        />
                        <InputOTPSlot
                          index={groupIndex * 2 + 1}
                          disabled={isOTPDisabled(
                            group as "hours" | "minutes" | "seconds",
                          )}
                        />
                      </InputOTPGroup>
                    </React.Fragment>
                  ))}
                </InputOTP>
              </div>
              <Button
                size="sm"
                className="w-full max-w-[250px]"
                onClick={() => {
                  if (!audioRef.current) return;
                  audioRef.current.currentTime = Math.max(0, time - 3);
                  setCurrentTime(Math.max(0, time - 3));
                }}
              >
                Go To
              </Button>
              <Button
                size="sm"
                className="w-full max-w-[250px]"
                onClick={() => setter(currentTime)}
              >
                Set To Current Track
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="w-full max-w-[250px]"
                onClick={() => setter(type === "start" ? 0 : duration)}
              >
                Reset
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          {endTime <= startTime && (
            <span className="block text-xs text-red-400">
              End time should be larger than start time.
            </span>
          )}
          {(startTime > duration || endTime > duration) && (
            <span className="block text-xs text-red-400">
              End time exceeded the original track.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
