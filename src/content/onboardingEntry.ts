import { mountOnboarding } from "./onboarding";
import { createProfileStore } from "../lib/profile";
import { requestSignIn } from "../lib/messages";
import { showWelcomeDone } from "./welcomeDone";

// Glue for the onboarding pop-up (deliberately untested, like content/index.ts): injected by the background worker
// into the active tab on first run, and loaded by welcome.html when there is no ordinary web page to show it on.
// welcome.html is Lexi's own tab: once the dialog is done, leave a short note there and close the tab when they click Got it.
function onWelcomeTabDone(): void {
  showWelcomeDone(
    document,
    () => {
      chrome.tabs.getCurrent((tab) => {
        if (tab?.id !== undefined) chrome.tabs.remove(tab.id);
        else window.close();
      });
    },
    () => void chrome.runtime.openOptionsPage()
  );
}

async function main() {
  const profileStore = createProfileStore(chrome.storage.sync);
  const initial = await profileStore.getProfile();
  if (initial.onboarded) return;
  mountOnboarding({
    initial,
    // chrome.identity isn't available to content scripts, so ask the background worker for the account email.
    signIn: requestSignIn,
    save: (profile) => profileStore.setProfile(profile),
  }, location.protocol === "chrome-extension:" ? onWelcomeTabDone : undefined);
}

main();
