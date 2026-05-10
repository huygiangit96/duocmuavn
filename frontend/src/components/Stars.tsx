import { IC } from "@/components/icons";

export function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => <IC.Star key={i} on={i <= Math.round(rating)} />)}
    </span>
  );
}
