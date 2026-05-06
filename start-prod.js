# EREN BOT — PROJECT RULES & ARCHITECTURE

## STACK
- WhatsApp bot built with Baileys V7
- Node.js with ES Modules (import/export, no require)
- JavaScript only (no TypeScript unless specified)

---

## FOLDER STRUCTURE
```
brain/
└── <feature>/
    ├── <feature>.js      ← the engine/logic (e.g. bible.js)
    ├── ascii.js          ← formatting for THIS feature only
    ├── handler1.js       ← returns data only
    ├── handler2.js       ← returns data only
    └── index.js          ← re-exports all handlers

commands/
└── commandname.js        ← the only file that touches sock
```

---

## THE RULES

### brain/<feature>/
- Every feature has its own folder inside `brain/`
- The engine file (e.g. `bible.js`) lives INSIDE the feature folder — not anywhere else
- Handlers import from `./featurename.js` — same folder, no weird paths
- **Handlers return data/objects only — no formatting, no sock, no sending**
- `ascii.js` lives inside the feature folder — it is feature-specific
- `index.js` re-exports everything from all handlers in that folder

### commands/
- Command files are the ONLY place that imports `sock` and sends messages
- Command file imports handlers from `../brain/<feature>/index.js`
- Command file imports ascii from `../brain/<feature>/ascii.js`
- Command file gets data from handler, wraps it with ascii, sends it
- Every command follows this structure:

```js
const commandName = {
    name: 'commandname',
    description: 'What it does',
    usage: '.commandname [args]',
    category: 'category',
    ownerOnly: false,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        // 1. call handler → get data
        // 2. wrap with ascii → get formatted string
        // 3. send with sock
    }
};

export default commandName;
```

### ascii.js
- Lives inside the feature folder it belongs to
- Only formats — no logic, no Bible calls, no sock
- Takes a result object and returns a formatted WhatsApp string
- Uses emoji blocks with this pattern:
```
EMOJI *Title* [TAG] EMOJI
──────────────────────────────
_subtitle_

body content

EMOJI _footer_ EMOJI
```

---

## IMPORT RULES
- Handlers import engine from `./enginefile.js` (same folder)
- Commands import handlers from `../brain/<feature>/index.js`
- Commands import ascii from `../brain/<feature>/ascii.js`
- **Never invent file paths. If a file doesn't exist in the folder, create it there.**

---

## ADDING A NEW FEATURE
1. Create `brain/<feature>/` folder
2. Put the engine/logic file inside it
3. Create handlers (return data only)
4. Create `ascii.js` (formatting only)
5. Create `index.js` (re-exports all handlers)
6. Create command files in `commands/`

---

## WHAT NOT TO DO
- Do NOT create extra folders or files that weren't asked for
- Do NOT add logic inside command files — that belongs in handlers
- Do NOT add formatting inside handlers — that belongs in ascii
- Do NOT import from paths outside the feature folder in handlers
- Do NOT create a `lib/` folder or any other invented folder
- Do NOT over-engineer. If asked for 4 files, create 4 files.