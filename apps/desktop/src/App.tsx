import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

import reactLogo from "@/assets/react.svg";

import "@/styles.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-16">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="text-xs tracking-[0.35em] text-slate-400 uppercase">
            Desktop starter
          </span>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Welcome to Tauri + React
          </h1>
          <p className="max-w-xl text-sm text-slate-300 sm:text-base">
            Click on the Tauri, Vite, and React logos to learn more.
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <a
            className="group rounded-full border border-slate-800 bg-slate-900/60 p-4 transition hover:-translate-y-1 hover:border-slate-600"
            href="https://vite.dev"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="/vite.svg"
              className="h-10 w-10 drop-shadow-lg transition group-hover:scale-105"
              alt="Vite logo"
            />
          </a>
          <a
            className="group rounded-full border border-slate-800 bg-slate-900/60 p-4 transition hover:-translate-y-1 hover:border-slate-600"
            href="https://tauri.app"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="/tauri.svg"
              className="h-10 w-10 drop-shadow-lg transition group-hover:scale-105"
              alt="Tauri logo"
            />
          </a>
          <a
            className="group rounded-full border border-slate-800 bg-slate-900/60 p-4 transition hover:-translate-y-1 hover:border-slate-600"
            href="https://react.dev"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={reactLogo}
              className="h-10 w-10 drop-shadow-lg transition group-hover:scale-105"
              alt="React logo"
            />
          </a>
        </div>

        <form
          className="flex w-full flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <input
            id="greet-input"
            className="h-11 flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-slate-500 focus:outline-none"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button
            className="h-11 rounded-xl bg-slate-100 px-6 text-sm font-semibold text-slate-900 transition hover:bg-white"
            type="submit"
          >
            Greet
          </button>
        </form>

        <p className="min-h-[1.5rem] text-sm text-slate-300">{greetMsg}</p>
      </div>
    </main>
  );
}

export default App;
