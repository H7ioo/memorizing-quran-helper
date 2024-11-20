import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";
import { MinusIcon } from "@radix-ui/react-icons";

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // TODO: fix selection goes to the end then to the clicked area (Fork from input-otp)

  const handleContainerClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!inputRef.current) return;
      const containerRect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - containerRect.left;
      const slotWidth = containerRect.width / props.maxLength!;
      const clickedSlotIndex = Math.floor(clickX / slotWidth);
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        clickedSlotIndex,
        clickedSlotIndex + 1,
      );
      setClickedSlotIndex(clickedSlotIndex);
    },
    [props.maxLength],
  );

  // Resets the cursor to the end of the input on focus to prevent selecting all the slots
  const handleOTPFocus = React.useCallback(() => {
    if (!inputRef.current) return;
    inputRef.current.selectionStart = inputRef.current.maxLength;
  }, []);

  const handleOTPDoubleClick = React.useCallback(() => {
    inputRef.current?.select();
  }, []);

  const [clickedSlotIndex, setClickedSlotIndex] = React.useState<number>(0);

  const handleRef = React.useCallback(
    (node: HTMLInputElement) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      // @ts-expect-error IDK to be honest
      inputRef.current = node as HTMLInputElement;
    },
    [ref],
  );

  const handleOTPSelect = React.useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      if (
        e.currentTarget.selectionStart === 0 &&
        e.currentTarget.selectionEnd === 6 &&
        // Only for mobile
        e.nativeEvent instanceof MouseEvent
      ) {
        e.currentTarget.focus();
        e.currentTarget.setSelectionRange(
          clickedSlotIndex,
          clickedSlotIndex + 1,
        );
      }
    },
    [clickedSlotIndex],
  );

  return (
    <div onClick={handleContainerClick}>
      <OTPInput
        ref={handleRef}
        containerClassName={cn(
          "flex items-center gap-2 has-[:disabled]:opacity-50",
          containerClassName,
        )}
        className={cn("disabled:cursor-not-allowed", className)}
        {...props}
        // Override the default focus behavior because it selects all the slots.
        onFocus={handleOTPFocus}
        // Implemented double click to select all instead of the onSelect implementation.
        onDoubleClick={handleOTPDoubleClick}
        // What we did is disabling the double click and mobile phone default range selector.
        onSelect={handleOTPSelect}
      />
    </div>
  );
});
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number; disabled?: boolean }
>(({ index, className, disabled, ...props }, ref) => {
  const { slots } = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = slots[index]!;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        disabled && "text-muted ring-muted",
        className,
      )}
      {...props}
    >
      {disabled ? "0" : char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <MinusIcon />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
