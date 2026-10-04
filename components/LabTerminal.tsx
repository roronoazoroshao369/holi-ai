"use client";

import { FormEvent, useState } from "react";

type Line = { kind: "input" | "output" | "success" | "error"; text: string };

const responses: Record<string, Line[]> = {
  "pwd": [{ kind: "output", text: "/opt/holi-lab" }],
  "ls": [{ kind: "output", text: "app.log  deploy.sh  nginx.conf  README.txt" }],
  "cat README.txt": [
    { kind: "output", text: "Mission: nginx cannot read /srv/site/index.html. Diagnose permissions, then verify the service." }
  ],
  "ls -l /srv/site/index.html": [
    { kind: "output", text: "-rw------- 1 root root 1842 Oct  5 00:00 /srv/site/index.html" }
  ],
  "chmod 644 /srv/site/index.html": [
    { kind: "success", text: "Permission updated. Good: the web worker can now read the file." }
  ],
  "curl localhost": [
    { kind: "success", text: "HTTP/1.1 200 OK\nHoli Lab: service healthy ✓" }
  ],
  "help": [
    { kind: "output", text: "Try: pwd, ls, cat README.txt, ls -l /srv/site/index.html, chmod 644 /srv/site/index.html, curl localhost" }
  ]
};

export function LabTerminal() {
  const [lines, setLines] = useState<Line[]>([
    { kind: "output", text: "Holi DevOps Lab — guided Linux incident #001" },
    { kind: "output", text: "Type 'help' if you need a hint." }
  ]);
  const [command, setCommand] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const cmd = command.trim();
    if (!cmd) return;
    const reply = responses[cmd] ?? [{ kind: "error" as const, text: `Command not available in this MVP simulator: ${cmd}` }];
    setLines(current => [...current, { kind: "input", text: `$ ${cmd}` }, ...reply]);
    setCommand("");
  }

  return (
    <div className="terminal">
      <div className="terminalTop">
        <span />
        <span />
        <span />
        <strong>lab@holi:~</strong>
      </div>
      <div className="terminalBody" aria-live="polite">
        {lines.map((line, index) => (
          <div key={index} className={`terminalLine ${line.kind}`}>{line.text}</div>
        ))}
        <form onSubmit={submit} className="terminalPrompt">
          <span>$</span>
          <input
            aria-label="Lab terminal command"
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
