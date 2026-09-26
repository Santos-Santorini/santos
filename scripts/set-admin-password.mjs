import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const USERS_FILE_PATH = path.join(process.cwd(), "data", "admin-users.json");

function getEnvConfig() {
  const envPath = path.join(process.cwd(), ".env.local");
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eqIdx = line.indexOf("=");
      if (eqIdx === -1) continue;
      const k = line.slice(0, eqIdx).trim();
      const v = line.slice(eqIdx + 1).trim();
      if (k === "NEXT_PUBLIC_SUPABASE_URL" && !url) url = v;
      if (k === "SUPABASE_SERVICE_ROLE_KEY" && !key) key = v;
    }
  }

  return { url, key };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Upotreba: node scripts/set-admin-password.mjs <username> <nova_lozinka>");
    console.log("Primer:   node scripts/set-admin-password.mjs santossuvido TvojaLozinka123");
    console.log("Primer:   node scripts/set-admin-password.mjs web.wise018@gmail.com TvojaLozinka123");
    process.exit(1);
  }

  const [rawUsername, newPassword] = args;
  const username = rawUsername.trim().toLowerCase();

  const { url, key } = getEnvConfig();
  let supabase = null;
  if (url && key) {
    supabase = createClient(url, key);
  }

  let data = { version: 1, users: [] };

  // Try to read from Supabase first
  if (supabase) {
    try {
      const { data: fileData, error } = await supabase.storage.from("site-config").download("data/admin-users.json");
      if (!error && fileData) {
        const text = await fileData.text();
        data = JSON.parse(text);
        if (!Array.isArray(data.users)) data.users = [];
        console.log("Preuzeto postojece stanje admin korisnika direktno sa Supabase-a.");
      }
    } catch (e) {
      console.warn("Nije uspelo citanje sa Supabase-a, koristim lokalni fajl:", e.message);
    }
  }

  // Fallback to local file if Supabase had no users
  if (!data.users.length && fs.existsSync(USERS_FILE_PATH)) {
    try {
      data = JSON.parse(fs.readFileSync(USERS_FILE_PATH, "utf-8"));
      if (!Array.isArray(data.users)) data.users = [];
    } catch (err) {
      console.error("Greska pri citanju lokalnog admin-users.json:", err.message);
    }
  }

  const newHash = hashPassword(newPassword.trim());
  const now = new Date().toISOString();

  let user = data.users.find((u) => (u.username || "").toLowerCase() === username);

  if (user) {
    user.passwordHash = newHash;
    user.updatedAt = now;
    user.isActive = true;
    console.log(`Lozinka uspesno promenjena za postojeceg korisnika: "${username}"`);
  } else {
    user = {
      id: username.includes("web.wise018") ? "admin_webwise_hidden" : `admin_${crypto.randomBytes(6).toString("hex")}`,
      username: username,
      displayName: username.includes("web.wise018") ? "WebWise Admin" : username,
      passwordHash: newHash,
      roleIds: ["owner"],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    };
    data.users.push(user);
    console.log(`Korisnik "${username}" nije postojao, pa je kreiran sa owner privilegijama i novom lozinkom.`);
  }

  // Save locally
  fs.mkdirSync(path.dirname(USERS_FILE_PATH), { recursive: true });
  fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Sacuvan lokalni fajl: ${USERS_FILE_PATH}`);

  // Upload to Supabase Storage if configured
  if (supabase) {
    try {
      const payload = Buffer.from(JSON.stringify(data, null, 2), "utf-8");
      const { error } = await supabase.storage.from("site-config").upload("data/admin-users.json", payload, {
        upsert: true,
        contentType: "application/json; charset=utf-8",
        cacheControl: "0",
      });
      if (error) {
        console.error("Greska pri uploadu na Supabase:", error.message);
      } else {
        console.log("Uspesno azurirano na Supabase Storage (site-config/data/admin-users.json)!");
      }
    } catch (e) {
      console.error("Greska pri komunikaciji sa Supabase:", e.message);
    }
  }
}

main().catch((err) => {
  console.error("Greska:", err);
  process.exit(1);
});
