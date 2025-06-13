import { useState } from "preact/hooks";
import logo from "./assets/icon.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import JsonEditorComponent from "./components/ui/json-editor";
import { ThemeToggle } from "./components/theme-toggle";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main class="min-h-screen bg-background text-foreground p-8">
      <div class="max-w-4xl mx-auto">
        <header class="text-center mb-12">
          <div class="flex justify-between items-start mb-6">
            <div class="flex-1"></div>
            <div class="flex justify-center">
              <img src={logo} class="w-16 h-16" alt="App logo" />
            </div>
            <div class="flex-1 flex justify-end">
              <ThemeToggle />
            </div>
          </div>
          <h1 class="text-4xl font-bold mb-4">Welcome to Your Application</h1>
          <p class="text-muted-foreground text-lg">
            A modern desktop application built for productivity and efficiency.
          </p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div class="bg-card p-6 rounded-lg border">
            <h2 class="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <input
                  type="text"
                  value={name}
                  onInput={(e) => setName(e.currentTarget.value)}
                  placeholder="Enter your name..."
                  class="flex-1 px-3 py-2 border rounded-md bg-background"
                />
                <button
                  onClick={greet}
                  class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Greet
                </button>
              </div>
              {greetMsg && (
                <div class="p-3 bg-muted rounded-md">
                  <p class="text-sm">{greetMsg}</p>
                </div>
              )}
            </div>
          </div>

          <div class="bg-card p-6 rounded-lg border">
            <h2 class="text-2xl font-semibold mb-4">Data Editor</h2>
            <div class="text-sm text-muted-foreground mb-4">
              Edit and manage your data with our built-in JSON editor.
            </div>
            <JsonEditorComponent data={{ test: "hello" }} setData={() => { }} />
          </div>
        </div>

        <footer class="text-center text-muted-foreground">
          <p>Ready to get started? Choose an action above.</p>
        </footer>
      </div>
    </main>
  );
}

export default App;
