"use client";

import { useEffect, useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { GameDetail } from "@/types";

type Props = {
  game: Pick<
    GameDetail,
    "id" | "slug" | "name" | "background_image" | "released" | "rating" | "genres" | "platforms"
  >;
};

export function SaveButton({ game }: Props) {
  const [saved, setSaved] = useState<boolean | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    fetch("/api/saved")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const list: { gameId: number }[] = data?.items ?? [];
        setSaved(list.some((s) => s.gameId === game.id));
      })
      .catch(() => setSaved(false));
    return () => {
      active = false;
    };
  }, [game.id]);

  const toggle = () => {
    startTransition(async () => {
      if (saved) {
        await fetch(`/api/saved/${game.id}`, { method: "DELETE" });
        setSaved(false);
      } else {
        await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameId: game.id,
            slug: game.slug,
            name: game.name,
            background_image: game.background_image,
            released: game.released,
            rating: game.rating,
            genres: game.genres?.map((g) => ({ id: g.id, name: g.name })),
            platforms: game.platforms?.map((p) => ({ id: p.id, name: p.name })),
          }),
        });
        setSaved(true);
      }
    });
  };

  return (
    <Button
      variant={saved ? "secondary" : "default"}
      onClick={toggle}
      disabled={pending || saved === null}
      className="gap-2"
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
