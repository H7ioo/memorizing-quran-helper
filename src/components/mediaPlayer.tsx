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
  // InputOTPSeparator, // TODO: update separator
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export function MediaPlayer() {
  // const [file, setFile] = useState<File>();
  const [mediaURL, setMediaURL] = useState<string>("");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileBlob = window.URL.createObjectURL(file);
      setMediaURL(fileBlob);
    }
  };

  // TODO: Clear button set value to null and files to null or undefined

  /*
    - Should I cut range completely so a new file or a new range only available from selected start-end time
      - Limit the range
      - Retype the range
  */

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
  const [_isEnded, setIsEnded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
        setIsEnded(true);
      }
    };

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [loop, startTime]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const checkBoundary = () => {
      if (audio.currentTime >= endTime) {
        if (loop) {
          audio.currentTime = startTime;
        } else {
          audio.pause();
          setIsPlaying(false);
          setIsEnded(true);
        }
      }
    };

    audio.addEventListener("timeupdate", checkBoundary);
    return () => audio.removeEventListener("timeupdate", checkBoundary);
  }, [endTime, loop, startTime]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      // audio.currentTime = startTime; // Don't reset time it's annoying this way
      audio.play();
      setIsPlaying(true);
      setIsEnded(false);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.volume = volume === 0 ? 1 : 0;
      setVolume(volume === 0 ? 1 : 0);
    }
  };

  const handleVolumeChange = (newValue: number[]) => {
    const newVolume = newValue[0]!;
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const handleSeek = (newValue: number[]) => {
    const newTime = newValue[0]!;
    setCurrentTime(newTime);
    if (audioRef.current) audioRef.current.currentTime = newTime;
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 60 / 60);
    const minutes = Math.floor((time / 60) % 60);
    const seconds = Math.floor(time % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newStartTime = isNaNFallback(parseFloat(e.target.value));
  //   setStartTime(newStartTime);
  //   if (audioRef.current && audioRef.current.currentTime < newStartTime) {
  //     audioRef.current.currentTime = newStartTime;
  //   }
  // };

  // const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newEndTime = isNaNFallback(parseFloat(e.target.value), duration);
  //   setEndTime(newEndTime);
  // };

  const toggleLoop = () => {
    setLoop((prev) => !prev);
  };

  const moveForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + 5, duration);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const moveBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - 5, 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // // TODO: Empty input feels better so allow the input to be empty and when empty it is the default.
  // const isNaNFallback = (number: number, fallback = 0) => {
  //   return isNaN(number) ? fallback : number;
  // };

  const getOTPTimeValue = (time: number) => {
    const hours = Math.floor(time / 60 / 60)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((time / 60) % 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");

    return `${hours}${minutes}${seconds}`;
  };

  const isOTPDisabled = (group: "hours" | "minutes" | "seconds") => {
    const time = {
      hours: Math.floor((duration / 60 / 60) % 60),
      minutes: Math.floor((duration / 60) % 60),
      seconds: Math.floor(duration % 60),
    };
    return time[group] < 1;
  };

  const convertOTPValueToSeconds = (value: string) => {
    // Ignores the hour value if it out of the time range
    const valueWithPadding = value.toString().padStart(6, "0");
    const hours = !isOTPDisabled("hours")
      ? parseInt(valueWithPadding.slice(0, 2))
      : 0;
    const minutes = !isOTPDisabled("minutes")
      ? parseInt(valueWithPadding.slice(2, 4))
      : 0;
    const seconds = !isOTPDisabled("seconds")
      ? parseInt(valueWithPadding.slice(4, 6))
      : 0;
    const timeInSeconds = hours * 60 * 60 + minutes * 60 + seconds;
    return timeInSeconds;
  };

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
              onClick={moveBackward}
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
              onClick={moveForward}
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
          <div className="flex flex-col items-center gap-2 md:flex-row md:items-end">
            <div>
              <Label htmlFor="start-time">Start Time</Label>
              {/* TODO: Input contains an input of type undefined with both value and defaultValue props */}
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                onChange={(value) => {
                  const timeInSeconds = convertOTPValueToSeconds(value);
                  if (startTime === timeInSeconds) return;
                  setStartTime(timeInSeconds);
                }}
                value={getOTPTimeValue(startTime)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} disabled={isOTPDisabled("hours")} />
                  <InputOTPSlot index={1} disabled={isOTPDisabled("hours")} />
                </InputOTPGroup>
                :
                <InputOTPGroup>
                  <InputOTPSlot index={2} disabled={isOTPDisabled("minutes")} />
                  <InputOTPSlot index={3} disabled={isOTPDisabled("minutes")} />
                </InputOTPGroup>
                :
                <InputOTPGroup>
                  <InputOTPSlot index={4} disabled={isOTPDisabled("seconds")} />
                  <InputOTPSlot index={5} disabled={isOTPDisabled("seconds")} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              size="sm"
              className="w-full max-w-[250px]"
              onClick={() => {
                if (!audioRef.current) return;
                audioRef.current.currentTime = startTime - 3; // To have room for updating
                setCurrentTime(startTime - 3);
              }}
            >
              Go To
            </Button>
            <Button
              size="sm"
              className="w-full max-w-[250px]"
              onClick={() => setStartTime(currentTime)}
            >
              Set To Current Track
            </Button>{" "}
            <Button
              size="sm"
              variant="destructive"
              className="w-full max-w-[250px]"
              onClick={() => setStartTime(0)}
            >
              Reset
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2 md:flex-row md:items-end">
            <div>
              <Label htmlFor="end-time">End Time</Label>
              {/* TODO: Input contains an input of type undefined with both value and defaultValue props */}
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                onChange={(value) => {
                  const timeInSeconds = convertOTPValueToSeconds(value);
                  if (endTime === timeInSeconds) return;
                  setEndTime(timeInSeconds);
                }}
                value={getOTPTimeValue(endTime)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} disabled={isOTPDisabled("hours")} />
                  <InputOTPSlot index={1} disabled={isOTPDisabled("hours")} />
                </InputOTPGroup>
                :
                <InputOTPGroup>
                  <InputOTPSlot index={2} disabled={isOTPDisabled("minutes")} />
                  <InputOTPSlot index={3} disabled={isOTPDisabled("minutes")} />
                </InputOTPGroup>
                :
                <InputOTPGroup>
                  <InputOTPSlot index={4} disabled={isOTPDisabled("seconds")} />
                  <InputOTPSlot index={5} disabled={isOTPDisabled("seconds")} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              size="sm"
              className="w-full max-w-[250px]"
              onClick={() => {
                if (!audioRef.current) return;
                audioRef.current.currentTime = endTime - 3; // To have room for updating
                setCurrentTime(endTime - 3);
              }}
            >
              Go To
            </Button>
            <Button
              size="sm"
              className="w-full max-w-[250px]"
              onClick={() => setEndTime(currentTime)}
            >
              Set To Current Track
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="w-full max-w-[250px]"
              onClick={() => setEndTime(duration)}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="mt-2">
          {endTime <= startTime && (
            <span className="block text-xs text-red-400">
              End time should be larger then start time.
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
