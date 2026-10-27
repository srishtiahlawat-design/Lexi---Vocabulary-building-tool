import { createApiKeyStore, isPlausibleApiKey } from "../lib/apiKey";
import { outlineEl } from "../ui/handdrawn";
import { PROVIDERS, DEFAULT_PROVIDER, isProvider, type Provider } from "../lib/providers";

const store = createApiKeyStore(chrome.storage.local);
const providerSelect = document.getElementById("provider") as HTMLSelectElement;
const input = document.getElementById("apiKey") as HTMLInputElement;
const status = document.getElementById("status") as HTMLDivElement;

// The hand-drawn outlines of the two fields (the same warm grey as the side panel's inputs).
for (const id of ["providerBox", "keyBox"]) {
  const svg = outlineEl("bar", { stroke: "#B3AC9E", width: 1.3 });
  svg.classList.add("outline");
  document.getElementById(id)!.prepend(svg);
}

const TICK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,12.5 9.5,18 20,6.5"/></svg>`;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

// The message only appears after Save is clicked; a good save fades out again after a few seconds, an error stays.
function showStatus(kind: "ok" | "err", text: string): void {
  clearTimeout(hideTimer);
  status.className = `${kind} show`;
  status.innerHTML = kind === "ok" ? TICK : "";
  status.append(text);
  if (kind === "ok") hideTimer = setTimeout(() => status.classList.remove("show"), 4000);
}

for (const p of PROVIDERS) {
  const option = document.createElement("option");
  option.value = p.id;
  option.textContent = p.label;
  providerSelect.appendChild(option);
}

function updatePlaceholder() {
  const provider = providerSelect.value as Provider;
  input.placeholder = PROVIDERS.find((p) => p.id === provider)?.keyPlaceholder ?? "";
}

providerSelect.value = DEFAULT_PROVIDER;
updatePlaceholder();
providerSelect.addEventListener("change", updatePlaceholder);

store.getSettings().then((settings) => {
  if (!settings) return;
  providerSelect.value = settings.provider;
  input.value = settings.key;
  updatePlaceholder();
});

document.getElementById("save")!.addEventListener("click", async () => {
  const providerValue = providerSelect.value;
  const key = input.value.trim();
  if (!isProvider(providerValue)) return;

  if (!isPlausibleApiKey(providerValue, key)) {
    const expected = PROVIDERS.find((p) => p.id === providerValue)?.keyPlaceholder;
    showStatus("err", `That doesn't look like a valid key for this provider (should look like "${expected}").`);
    return;
  }
  await store.setSettings({ provider: providerValue, key });
  showStatus("ok", "Saved on this device");
});
