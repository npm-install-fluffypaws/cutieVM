// ---- Settings: edit these to match the files you downloaded -------------
const CONFIG = {
  wasm: "lib/v86.wasm",
  bios: "bios/seabios.bin",
  vgaBios: "bios/vgabios.bin",
  cdrom: "images/linux.iso",
  memoryMB: 128,
  // Bump this if you change the ISO or memory size. Old saves won't match the new setup.
  saveVersion: "v1",
};
// -------------------------------------------------------------------------

const statusEl = document.getElementById("status");
const say = (msg) => { statusEl.textContent = msg; };

// Saved state lives in this browser's IndexedDB.
const DB_NAME = "linux-vm";
const STORE = "states";
const KEY = "state-" + CONFIG.saveVersion;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbOp(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
  });
}
const putState = (buf) => dbOp("readwrite", (s) => s.put(buf, KEY));
const getState = () => dbOp("readonly", (s) => s.get(KEY));
const deleteState = () => dbOp("readwrite", (s) => s.delete(KEY));

const emulator = new V86({
  wasm_path: CONFIG.wasm,
  memory_size: CONFIG.memoryMB * 1024 * 1024,
  vga_memory_size: 8 * 1024 * 1024,
  screen_container: document.getElementById("screen_container"),
  bios: { url: CONFIG.bios },
  vga_bios: { url: CONFIG.vgaBios },
  cdrom: { url: CONFIG.cdrom },
  autostart: true,
});

let ready = false;

async function save(quiet) {
  if (!ready) return;
  try {
    const state = await emulator.save_state();
    await putState(state);
    say(quiet ? "Autosaved at " + new Date().toLocaleTimeString() : "State saved.");
  } catch (e) {
    say("Could not save: " + e.message);
  }
}

async function load() {
  try {
    const state = await getState();
    if (!state) { say("No saved state yet."); return; }
    await emulator.restore_state(state);
    say("Saved state loaded.");
  } catch (e) {
    say("Could not load: " + e.message);
  }
}

emulator.add_listener("emulator-ready", async () => {
  ready = true;
  const existing = await getState().catch(() => null);
  if (existing) {
    await load();
  } else {
    say("Booting. Your first save will appear next visit.");
  }
});

document.getElementById("save").onclick = () => save(false);
document.getElementById("load").onclick = load;
document.getElementById("delete").onclick = async () => {
  await deleteState();
  say("Saved state deleted.");
};
document.getElementById("reset").onclick = () => {
  emulator.restart();
  say("Restarted. Saved state is untouched until you save again.");
};

let timer = null;
document.getElementById("autosave").onchange = (e) => {
  clearInterval(timer);
  if (e.target.checked) timer = setInterval(() => save(true), 60000);
};
