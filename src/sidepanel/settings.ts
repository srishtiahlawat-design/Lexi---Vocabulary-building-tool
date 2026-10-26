import {
  ARRIVAL_TIMES,
  GOALS,
  isProfileComplete,
  needsIndustry,
  type GoalId,
  type Profile,
} from "../lib/profile";
import { CONTROLS_CSS, ICON_CLOCK, createDropdown, createIndustryField, createTextField } from "../ui/controls";
import { outlineEl } from "../ui/handdrawn";
import { ICON_BACK, ICON_TRASH } from "../lib/icons";

// The side panel's Settings view: the same four things onboarding asked for (account, name, arrival time, goal +
// industry), editable at any time. Follows the finalised "Settings" boards on the design canvas: goal is a dropdown
// with the current goal on top and the other goals listed under it; time is a dropdown too.

export interface SettingsDeps {
  profile: Profile;
  save(profile: Profile): Promise<void>;
  signIn(): Promise<string | null>;
  // Signing out forgets the linked Google account; the library and settings stay on this device.
  signOut(): Promise<void>;
  confirmDelete(): boolean;
  deleteAccount(): Promise<void>;
  onBack(): void;
  onDeleted(): void;
}

export const SETTINGS_CSS =
  CONTROLS_CSS +
  `
  .settings { --lx-edge: 0px; }
  .settings .sBody { flex: 1; min-height: 0; overflow-y: auto; padding-bottom: 8px; }
  /* sections are 12px apart (the 4px of padding is part of that); no rules between them */
  .settings .sSection { margin: 8px var(--pad) 0 var(--padL); padding-top: 4px; }
  .settings .sSection.first { margin: 0; padding: 0 var(--pad) 0 var(--padL); }
  .settings .sLabel { display: block; padding: 14px 0 8px; font: 500 11px/1.2 var(--sans); letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
  .settings .sSection.first .sLabel { padding-top: 16px; }
  .settings .lx-field, .settings .lx-ddTrigger { height: 42px; font-size: 14px; }
  .settings .lx-industry { padding: 16px 0 0; border-bottom: none; }
  .settings .profile { position: relative; padding: 12px 14px; display: flex; align-items: center; gap: 12px; background: var(--off); border-radius: 10px; }
  .settings .profile > * { position: relative; }
  .settings .avatar { flex: none; width: 38px; height: 38px; border-radius: 50%; background: #3A3833; color: #fff; display: flex; align-items: center; justify-content: center; font: 600 15px var(--sans); }
  .settings .who2 { min-width: 0; flex: 1; }
  .settings .who2 .pname { font: 600 14px var(--sans); }
  .settings .who2 .pmail { margin-top: 2px; font: 400 12px var(--sans); color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .settings .linkBtn { flex: none; display: flex; align-items: center; gap: 6px; font: 500 13px var(--sans); color: #A33333; }
  .settings .linkBtn.neutral { color: var(--ink); }
  .settings .linkBtn svg { width: 16px; height: 16px; }
  .settings .sFoot { flex: none; padding: 16px var(--pad) 12px; display: flex; flex-direction: column; gap: 6px; border-top: 1px solid var(--rule); }
  .settings .sSave { width: 100%; height: 44px; font: 400 14px var(--sans); color: var(--ink-2); background: var(--off); border: 1.5px solid var(--border); border-radius: 14px; box-shadow: 0 8px 14px -8px rgba(60,50,40,0.30); }
  .settings .sSave:hover:not(:disabled) { background: #FFF9EE; }
  .settings .sSave:disabled { opacity: 0.75; cursor: default; }
  .settings .sSave.saved { color: var(--success, #4f7053); border-color: rgba(79,112,83,0.45); box-shadow: none; }
  .settings .sDelete { height: 36px; display: flex; align-items: center; justify-content: center; gap: 6px; font: 500 13px var(--sans); color: #A33333; }
  .settings .sDelete svg { width: 15px; height: 15px; }
  .settings .sErr { margin: 10px var(--pad) 0 var(--padL); font: 400 12px/16px var(--sans); color: var(--error, #a33333); }
  .settings .sErr:empty { display: none; }
`;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const SIGN_OUT_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;

export function renderSettings(deps: SettingsDeps): HTMLDivElement {
  let draft: Profile = { ...deps.profile };

  const panel = h("div", "panel lx settings");

  // The paper holds the header and the scrolling body; the red margin line runs down it and stops at the footer.
  const paper = h("div", "paper");
  panel.appendChild(paper);

  const header = h("div", "subHeader");
  const back = h("button", "iconBtn back");
  back.setAttribute("aria-label", "Back");
  back.innerHTML = ICON_BACK;
  back.addEventListener("click", deps.onBack);
  header.append(back, h("div", "title", "Settings"));
  paper.appendChild(header);

  const body = h("div", "sBody");
  paper.appendChild(body);

  // Profile: the linked Google account, with sign out (or sign in when there isn't one).
  const profileSection = h("div", "sSection first");
  profileSection.appendChild(h("span", "sLabel", "Profile"));
  const card = h("div", "profile");
  profileSection.appendChild(card);
  body.appendChild(profileSection);

  function paintProfile(): void {
    card.replaceChildren(outlineEl("bar"));
    const initial = (draft.name.trim() || draft.email || "L").charAt(0).toUpperCase();
    const who = h("div", "who2");
    if (draft.email) {
      who.append(h("div", "pname", draft.name.trim() || "Your account"), h("div", "pmail", draft.email));
      const out = h("button", "linkBtn");
      out.type = "button";
      out.innerHTML = SIGN_OUT_ICON;
      out.append("Sign out");
      out.addEventListener("click", async () => {
        await deps.signOut();
        draft = { ...draft, email: "" };
        paintProfile();
      });
      card.append(h("div", "avatar", initial), who, out);
    } else {
      who.append(h("div", "pname", draft.name.trim() || "Not signed in"), h("div", "pmail", "Sign in to sync your library"));
      const inBtn = h("button", "linkBtn neutral", "Sign in");
      inBtn.type = "button";
      inBtn.addEventListener("click", async () => {
        const email = await deps.signIn().catch(() => null);
        if (email) {
          draft = { ...draft, email };
          paintProfile();
        }
      });
      card.append(h("div", "avatar", initial), who, inBtn);
    }
  }
  paintProfile();

  // Your name
  const nameSection = h("div", "sSection");
  const nameLabel = h("label", "sLabel", "Your name");
  const nameField = createTextField();
  const nameInput = nameField.input;
  nameInput.id = "settings-name";
  nameLabel.htmlFor = nameInput.id;
  nameInput.value = draft.name;
  nameInput.addEventListener("input", () => {
    draft = { ...draft, name: nameInput.value };
  });
  nameSection.append(nameLabel, nameField.box);
  body.appendChild(nameSection);

  // Word of the day arrives at
  const timeSection = h("div", "sSection");
  timeSection.appendChild(h("span", "sLabel", "Word of the day arrives at"));
  timeSection.appendChild(
    createDropdown({
      ariaLabel: "Arrives at",
      options: ARRIVAL_TIMES,
      value: draft.arrivalTime,
      mode: "all",
      leadingIcon: ICON_CLOCK,
      onChange: (v) => {
        draft = { ...draft, arrivalTime: v };
      },
    }).el
  );
  body.appendChild(timeSection);

  // Your goal (+ industry)
  const goalSection = h("div", "sSection");
  goalSection.appendChild(h("span", "sLabel", "Your goal"));
  const goalSlot = h("div");
  goalSection.appendChild(goalSlot);
  body.appendChild(goalSection);

  const industrySlot = h("div");
  function paintIndustry(): void {
    industrySlot.replaceChildren();
    if (needsIndustry(draft.goal)) {
      industrySlot.appendChild(createIndustryField(draft.industry, (v) => (draft = { ...draft, industry: v })).el);
    }
  }
  goalSlot.appendChild(
    createDropdown({
      ariaLabel: "Your goal",
      options: GOALS.map((g) => ({ value: g.id, label: g.label })),
      value: draft.goal,
      placeholder: "Choose a goal",
      mode: "others",
      onChange: (v) => {
        draft = { ...draft, goal: v as GoalId };
        paintIndustry();
      },
    }).el
  );
  goalSlot.appendChild(industrySlot);
  paintIndustry();

  const errEl = h("div", "sErr");
  body.appendChild(errEl);

  // Footer: Save changes (primary) and Delete account (tertiary).
  const foot = h("div", "sFoot");
  const save = h("button", "sSave", "Save changes");
  save.type = "button";
  const del = h("button", "sDelete");
  del.type = "button";
  del.innerHTML = ICON_TRASH;
  del.append("Delete account");
  foot.append(save, del);
  panel.appendChild(foot);

  save.addEventListener("click", async () => {
    errEl.textContent = "";
    const next: Profile = {
      ...draft,
      name: draft.name.trim(),
      industry: needsIndustry(draft.goal) ? draft.industry.trim() : "",
      onboarded: true,
    };
    if (!next.name) {
      errEl.textContent = "Add a name for your library.";
      return;
    }
    if (!isProfileComplete(next)) {
      errEl.textContent = next.goal ? "Tell us which industry you work in." : "Choose a goal.";
      return;
    }
    save.disabled = true;
    try {
      await deps.save(next);
      draft = next;
      save.textContent = "Saved";
      save.classList.add("saved");
      setTimeout(() => {
        save.textContent = "Save changes";
        save.classList.remove("saved");
        save.disabled = false;
      }, 1800);
    } catch (err) {
      errEl.textContent = err instanceof Error ? err.message : "Couldn't save your changes.";
      save.disabled = false;
    }
  });

  del.addEventListener("click", async () => {
    if (!deps.confirmDelete()) return;
    errEl.textContent = "";
    try {
      await deps.deleteAccount();
      deps.onDeleted();
    } catch (err) {
      errEl.textContent = err instanceof Error ? err.message : "Couldn't delete your account.";
    }
  });

  return panel;
}
