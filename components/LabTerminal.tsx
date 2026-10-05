"use client";

import { FormEvent, useState } from "react";

import { execute, initialLabState, type Line as ReplyLine } from "../lib/linux-simulator";

type Line = ReplyLine | { kind: "input"; text: string };

export function LabTerminal() {
  const [lines, setLines] = useState<Line[]>([
    { kind: "output", text: "SIMULATED — Linux incident #001: HTTP 403, worker www-data" },
    { kind: "output", text: "Type 'help' if you need a hint." }
  ]);
  const [state, setState] = useState(initialLabState);
  const [command, setCommand] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const cmd = command.trim();
    if (!cmd) return;
    const result = execute(state, cmd);
    setState(result.state);
    const reply = result.lines;
    setLines(current => [...current.slice(-100), { kind: "input", text: `$ ${cmd}` }, ...reply]);
    setCommand("");
  }

  return (
    <div className="terminal">
      <div className="terminalTop">
        <span />
        <span />
        <span />
        <strong>SIMULATED · lab@holi:~</strong>
      </div>
      <div className="terminalBody" aria-live="polite">
        {lines.map((line, index) => (
          <div key={index} className={`terminalLine ${line.kind}`}>{line.text}</div>
        ))}
        <form onSubmit={submit} className="terminalPrompt">
          <span>$</span>
          <input
            aria-label="Lab terminal command"
            maxLength={200}
            autoComplete="off"
            value={command}
            onChange={event => setCommand(event.target.value)}
            placeholder="type a command…"
          />
        </form>
      </div>
    </div>
  );
}

