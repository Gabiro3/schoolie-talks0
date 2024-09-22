"use client";

import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled>
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Please wait
        </Button>
      ) : (
        <Button type="submit">{text}</Button>
      )}
    </>
  );
}

export function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button className="mt-2 w-full" disabled size="sm">
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          Please wait
        </Button>
      ) : (
        <Button size="sm" className="mt-2 w-full" type="submit">
          Save
        </Button>
      )}
    </>
  );
}

export function UpVote({ isActive }: { isActive: boolean }) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button variant="outline" size="icon" disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <Button
          variant={isActive ? "solid" : "outline"} // Change variant if active
          className={isActive ? "bg-green-500" : ""}
          size="sm"
          type="submit"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}

export function DownVote({ isActive }: { isActive: boolean }) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button variant="outline" size="icon" disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <Button
          variant={isActive ? "solid" : "outline"} // Change variant if active
          className={isActive ? "bg-red-500" : ""}
          size="sm"
          type="submit"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}

