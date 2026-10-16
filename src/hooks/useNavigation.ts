import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";

export function useNavigation(
  user: any,
  setPage: Dispatch<SetStateAction<string>>
) {
  const navigate = useNavigate();

  function go(p: string) {
    const protectedPages = [
      "dashboard",
      "levels",
      "discuss",
      "leaderboard",
      "profile",
      "challenge",
      "devdash",
    ];

    if (protectedPages.indexOf(p) !== -1 && !user) {
      setPage("login");
      navigate("/login");
      return;
    }

    setPage(p);

    if (p === "landing") {
      navigate("/");
    } else {
      navigate(`/${p}`);
    }
  }

  return go;
}