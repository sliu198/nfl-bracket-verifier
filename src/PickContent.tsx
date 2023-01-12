import * as ToggleGroup from "@radix-ui/react-toggle-group";

import "./PickContent.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import computeHash from "./computeHash";

export type MatchupType = [string, string];

type PickContentProps = {
  matchups: MatchupType[];
  picks: { [matchupName: string]: string };
  data: Uint8Array | null;
  setMatchupPick: (matchupName: string, value: string) => void;
};

export default function PickContent(props: PickContentProps) {
  const { matchups, picks, data, setMatchupPick } = props;

  const [hash, setHash] = useState<string>("");

  const [copyCount, setCopyCount] = useState<number>(0);
  const [copyStyle, setCopyStyle] = useState<any>(null);
  const hashElementRef = useRef<any>();

  const objectUrl = useMemo<string>(() => {
    if (!data) return "";

    return URL.createObjectURL(new Blob([data], { type: "application/json" }));
  }, [data]);

  useEffect(() => {
    if (!data) {
      setHash("");
      return;
    }

    let abort = false;
    computeHash(data).then((hash) => {
      if (abort) return;

      setHash(hash);
    });
    return () => {
      abort = true;
    };
  }, [data]);

  const copyHash = useCallback(() => {
    navigator.clipboard.writeText(hash).then(() => {
      setCopyCount((count) => count + 1);
      const element = hashElementRef.current;
      setCopyStyle({
        height: element.offsetHeight,
        width: element.offsetWidth,
        boxSizing: "border-box",
      });
    });
  }, [hash]);

  useEffect(() => {
    if (!copyCount) return;

    const handle = setTimeout(() => {
      setCopyCount(0);
      setCopyStyle(null);
    }, 2000);

    return () => {
      clearTimeout(handle);
    };
  }, [copyCount]);

  return (
    <div>
      <div className="MatchupsSection">
        {matchups.map((matchup) => {
          const [first, second] = matchup;
          const matchupName = makeMatchupName(matchup);
          return (
            <ToggleGroup.Root
              className="PickDisplayGroup"
              type="single"
              aria-label={matchupName}
              key={matchupName}
              onValueChange={(value) => setMatchupPick(matchupName, value)}
              value={picks[matchupName]}
              orientation={"horizontal"}
            >
              <ToggleGroup.Item className="PickDisplay Focusable" value={first}>
                {first}
              </ToggleGroup.Item>
              <ToggleGroup.Item
                className="PickDisplay Focusable"
                value={second}
              >
                {second}
              </ToggleGroup.Item>
            </ToggleGroup.Root>
          );
        })}
      </div>
      <div className="ReceiptsSection">
        {hash && (
          <button
            className="Signature Focusable"
            onClick={copyHash}
            ref={hashElementRef}
            style={copyStyle}
          >
            {copyCount ? (
              "Copied!"
            ) : (
              <>
                Send this to the group now:
                <br />
                {hash}
                <br />
                Click to copy
              </>
            )}
          </button>
        )}
        {objectUrl && hash && (
          <a
            className="Download Focusable"
            href={objectUrl}
            download={`picks-${hash}.json`}
            role="button"
          >
            Download this file now
            <br />
            Send to the group AFTER the games
          </a>
        )}
      </div>
    </div>
  );
}

function makeMatchupName([first, second]: MatchupType): string {
  return `${first} v ${second}`;
}
