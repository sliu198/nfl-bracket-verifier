import "./VerifyContent.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import computeHash from "./computeHash";
import buttonKeydownHandler from "./buttonKeydownHandler";

type VerifyContentPropsType = {
  data: Uint8Array | null;
  hash: string;
  fileName: string;
  hasFileError: boolean;
  setData: (data: Uint8Array | null) => void;
  setHash: (hash: string) => void;
  setFileName: (fileName: string) => void;
  setHasFileError: (hasFileError: boolean) => void;
};

const TEXT_DECODER = new TextDecoder();

export default function VerifyContent(props: VerifyContentPropsType) {
  const {
    data,
    hash,
    fileName,
    hasFileError,
    setData,
    setHash,
    setFileName,
    setHasFileError,
  } = props;

  const [verifyState, setVerifyState] = useState<boolean | null>(null);

  const readFile = useCallback(
    (file?: File) => {
      setVerifyState(null);
      setHash("");
      setHasFileError(false);
      setData(null);
      setFileName("");
      if (!file) return;
      setFileName(file.name);

      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        setData(new Uint8Array(fileReader.result as ArrayBuffer));
      });
      fileReader.readAsArrayBuffer(file);
    },
    [setData, setHash, setFileName, setHasFileError]
  );

  useEffect(() => {
    if (!data || !hash || hasFileError) {
      setVerifyState(null);
      return;
    }

    let abort = false;
    computeHash(data).then((hashFromData) => {
      if (abort) return;
      setVerifyState(hashFromData === hash.toUpperCase());
    });

    return () => {
      abort = true;
    };
  }, [data, hash, hasFileError]);

  const picksDisplay: JSX.Element[] = useMemo(() => {
    if (!data) return [];

    try {
      const dataString = TEXT_DECODER.decode(data);
      const { picks } = JSON.parse(dataString) as { picks: string };
      const picksDisplay: JSX.Element[] = [];
      Object.entries(picks).forEach(([matchName, value]) => {
        const [first, second] = matchName.split(" v ");
        if (!first || !second || ![first, second].includes(value as string))
          throw new Error();

        picksDisplay.push(
          <PickDisplay
            key={matchName}
            first={first}
            second={second}
            value={value}
          />
        );
      });

      return picksDisplay;
    } catch (error) {
      setHasFileError(true);
      return [];
    }
  }, [data, setHasFileError]);

  return (
    <div className="VerifyContent">
      <div className="HorizontalCenterContainer">
        <label
          className={[
            "FilePickerLabel",
            "Focusable",
            !fileName ? "NoFile" : hasFileError ? "FileError" : null,
          ].join(" ")}
          role="button"
          tabIndex={0}
          onKeyDown={buttonKeydownHandler}
        >
          {!fileName
            ? "Choose file"
            : hasFileError
            ? `Error loading file: ${fileName}`
            : `Loaded file: ${fileName}`}
          <input
            className="FilePicker"
            type="file"
            accept="application/json"
            onChange={(event) => {
              readFile(event.target.files?.[0]);
            }}
          />
        </label>
      </div>
      <div className="PickList">{picksDisplay}</div>
      <div className="HorizontalCenterContainer">
        <input
          className={[
            "HashInput",
            "Focusable",
            verifyState == null
              ? null
              : verifyState
              ? "VerifyTrue"
              : "VerifyFalse",
          ].join(" ")}
          onChange={(event) => {
            setHash(event.target.value);
          }}
          value={hash}
          placeholder="Enter Verification Code"
        />
      </div>
    </div>
  );
}

function PickDisplay({
  first,
  second,
  value,
}: {
  first: string;
  second: string;
  value: string;
}) {
  return (
    <ToggleGroup.Root
      className="PickDisplayGroup"
      type="single"
      tabIndex={-1}
      value={value}
      disabled
    >
      <ToggleGroup.Item className="PickDisplay" value={first}>
        {first}
      </ToggleGroup.Item>
      <ToggleGroup.Item className="PickDisplay" value={second}>
        {second}
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
