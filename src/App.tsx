import React, { useState, useCallback, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import "./App.css";
import PickContent, { MatchupType } from "./PickContent";
import VerifyContent from "./VerifyContent";

const MATCHUPS: MatchupType[] = [
  ["JAX", "KC"],
  ["NYG", "PHI"],
  ["CIN", "BUF"],
  ["DAL", "SF"],
];

const TEXT_ENCODER = new TextEncoder();

function App() {
  const [picks, setPicks] = useState<{ [matchName: string]: string }>({});
  const [pickData, setPickData] = useState<Uint8Array | null>(null);

  const [verifyFileName, setVerifyFileName] = useState<string>("");
  const [verifyHasFileError, setVerifyHasFileError] = useState<boolean>(false);
  const [verifyData, setVerifyData] = useState<Uint8Array | null>(null);
  const [verifyHash, setVerifyHash] = useState<string>("");

  const setMatchupPick = useCallback((matchupName: string, value: string) => {
    if (!value) return;

    setPicks((picks) => {
      return {
        ...picks,
        [matchupName]: value,
      };
    });
  }, []);

  useEffect(() => {
    if (Object.keys(picks).length !== MATCHUPS.length) return;

    const salt = crypto
      .getRandomValues(new BigUint64Array(1))
      .at(0)
      ?.toString(36);
    const data = TEXT_ENCODER.encode(JSON.stringify({ picks, salt }));
    setPickData(data);
  }, [picks]);

  return (
    <Tabs.Root className="TabsRoot" defaultValue="pick">
      <Tabs.List className="TabsList" aria-label="Manage your account">
        <Tabs.Trigger className="TabsTrigger Focusable" value="pick">
          Pick
        </Tabs.Trigger>
        <Tabs.Trigger className="TabsTrigger Focusable" value="verify">
          Verify
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content className="TabsContent" value="pick" tabIndex={-1}>
        <PickContent
          matchups={MATCHUPS}
          picks={picks}
          data={pickData}
          setMatchupPick={setMatchupPick}
        />
      </Tabs.Content>
      <Tabs.Content className="TabsContent" value="verify" tabIndex={-1}>
        <VerifyContent
          data={verifyData}
          hash={verifyHash}
          fileName={verifyFileName}
          hasFileError={verifyHasFileError}
          setData={setVerifyData}
          setHash={setVerifyHash}
          setFileName={setVerifyFileName}
          setHasFileError={setVerifyHasFileError}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}

export default App;
