import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const MODEL = "claude-sonnet-4-20250514";
const API_URL = "https://api.anthropic.com/v1/messages";
const STORAGE_KEY = "sanctuary-v1";

const DEFAULT_JOURNALS = [
  { id: "1", name: "Productivity",           emoji: "📋", color: "#c9a96e", content: "", savedContent: "", lastUpdated: null },
  { id: "2", name: "Subconscious Reprograms", emoji: "🧠", color: "#a8c4b8", content: "", savedContent: "", lastUpdated: null },
  { id: "3", name: "General",                emoji: "💭", color: "#b8a8c4", content: "", savedContent: "", lastUpdated: null },
];

const WELCOME_MSG = {
  role: "assistant",
  content: `Welcome. This is your private space to think, feel, and grow. 🌿

I have access to all your journals and treat them as one integrated picture of you. The connections between your different areas of life are often where the deepest insights live.

**To get started:** select a journal from the sidebar, paste your entries, and save. You can load entries into multiple journals before we begin.

Once you're ready, ask me anything — or just tell me how you're feeling today.

💭 *What's been on your mind most lately?*`,
};

const QUICK_CHIPS = [
  "What patterns do you see?",
  "Connect my journals",
  "Give me a prompt",
  "What am I avoiding?",
  "What's my biggest theme?",
];

const GUIDED_SESSIONS = [
  { id: "cbt",        emoji: "🔍", name: "CBT Thought Record",   desc: "Examine a difficult thought and reframe it" },
  { id: "values",     emoji: "🎯", name: "Values Excavation",    desc: "Uncover what you actually stand for" },
  { id: "shadow",     emoji: "🌑", name: "Shadow Work",          desc: "Explore the parts of yourself you avoid" },
  { id: "innerchild", emoji: "🌱", name: "Inner Child",          desc: "Connect with your younger self" },
  { id: "patterns",   emoji: "🔄", name: "Pattern Scan",         desc: "Deep read of all your journals" },
];

// ─────────────────────────────────────────────
// THEMES
// ─────────────────────────────────────────────

const T = {
  dark: {
    appBg: "#0d0c0b", sidebarBg: "#111009", sidebarBorder: "#1e1c19",
    jBg: "#0f0e0d", jText: "#c9bfaf", jPlaceholder: "#3a3530",
    hTitle: "#e8e0d4", hSub: "#4a4540", hBorder: "#1a1815",
    fBorder: "#1e1c19", wordCount: "#4a4540", divider: "#1e1c19",
    chatBg: "#0d0c0b", chatBorder: "#1a1815",
    chatTitle: "#e8e0d4", chatSub: "#5a5248",
    uBg: "#1a1815", uBorder: "#2a2520", uText: "#e8e0d4",
    aText: "#d4c9b8", promptColor: "#c9a96e", qColor: "#a8c4b8",
    iBg: "#141210", iBorder: "#2a2520", iText: "#e8e0d4", iPlaceholder: "#4a4540",
    chipBorder: "#1e1c19", chipText: "#5a5248", chipHoverBorder: "#3a3530", chipHoverText: "#c9bfaf",
    privacyText: "#252220",
    btnBorder: "#2a2520", btnText: "#6a6058", btnHoverBorder: "#4a4540", btnHoverText: "#c9bfaf",
    saveBg: "#c9a96e", saveText: "#0d0c0b", saveHover: "#e0be84",
    sendBg: "#c9a96e", sendDisabled: "#1e1c19", sendText: "#0d0c0b",
    dotBg: "#c9a96e", statusBg: "#6ab87a", statusGlow: "#6ab87a55", statusText: "#6ab87a",
    noStatus: "#4a4540", avatarBg: "linear-gradient(135deg,#3a2e22,#5a4535)",
    scrollThumb: "#2a2520",
    ajBg: "#1a1815", ajBorder: "#2a2520",
    jHover: "#141210", jItemText: "#8a7e72", jItemActive: "#e8e0d4",
    newBtnBg: "#1a1815", newBtnBorder: "#2a2520", newBtnText: "#7a6e62",
    overlay: "rgba(0,0,0,0.7)", modalBg: "#111009", modalBorder: "#2a2520",
    fieldBg: "#0d0c0b", fieldBorder: "#2a2520", fieldText: "#e8e0d4",
    sessionBg: "#1a1815", sessionBorder: "#2a2520", sessionText: "#8a7e72",
    railHover: "#161412",
    tagBg: "#1a1815", tagBorder: "#2a2520", tagText: "#7a6e62",
  },
  light: {
    appBg: "#f7f4ef", sidebarBg: "#f0ebe2", sidebarBorder: "#e0d9ce",
    jBg: "#ffffff", jText: "#1a1612", jPlaceholder: "#b8b0a4",
    hTitle: "#1a1612", hSub: "#9a9088", hBorder: "#ede8e0",
    fBorder: "#ede8e0", wordCount: "#9a9088", divider: "#e8e2d8",
    chatBg: "#f7f4ef", chatBorder: "#ede8e0",
    chatTitle: "#1a1612", chatSub: "#9a9088",
    uBg: "#ede8e0", uBorder: "#ddd8ce", uText: "#1a1612",
    aText: "#2a2520", promptColor: "#8b6914", qColor: "#2a6e5e",
    iBg: "#ffffff", iBorder: "#ddd8ce", iText: "#1a1612", iPlaceholder: "#b8b0a4",
    chipBorder: "#ddd8ce", chipText: "#8a8078", chipHoverBorder: "#b8b0a4", chipHoverText: "#2a2520",
    privacyText: "#c8c0b8",
    btnBorder: "#ddd8ce", btnText: "#8a8078", btnHoverBorder: "#b8b0a4", btnHoverText: "#2a2520",
    saveBg: "#8b6914", saveText: "#ffffff", saveHover: "#a07a1a",
    sendBg: "#8b6914", sendDisabled: "#ddd8ce", sendText: "#ffffff",
    dotBg: "#8b6914", statusBg: "#2e8b57", statusGlow: "#2e8b5755", statusText: "#2e8b57",
    noStatus: "#9a9088", avatarBg: "linear-gradient(135deg,#d4c4a0,#c4a86e)",
    scrollThumb: "#c8bfb0",
    ajBg: "#e8e2d8", ajBorder: "#ddd8ce",
    jHover: "#ede8e0", jItemText: "#8a8078", jItemActive: "#1a1612",
    newBtnBg: "#ede8e0", newBtnBorder: "#ddd8ce", newBtnText: "#8a8078",
    overlay: "rgba(0,0,0,0.3)", modalBg: "#f7f4ef", modalBorder: "#ddd8ce",
    fieldBg: "#ffffff", fieldBorder: "#ddd8ce", fieldText: "#1a1612",
    sessionBg: "#ede8e0", sessionBorder: "#ddd8ce", sessionText: "#8a8078",
    railHover: "#ebe6dc",
    tagBg: "#ede8e0", tagBorder: "#ddd8ce", tagText: "#8a8078",
  },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const genId = () => Math.random().toString(36).slice(2, 9);
const fmtDate = (ts) => ts ? new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "no entries";
const wordCount = (s) => s.trim() ? s.trim().split(/\s+/).length : 0;

function buildSystemPrompt(journals) {
  const ctx = journals
    .filter(j => j.savedContent.trim())
    .map(j => `[${j.emoji} ${j.name.toUpperCase()}]\n${j.savedContent}`)
    .join("\n\n---\n\n");

  return `You are an exceptionally skilled, warm, and insightful therapist and journaling guide. You have deep training in CBT, psychodynamic therapy, mindfulness, and narrative therapy.

The person keeps multiple separate journals covering distinct areas of their life. Treat them as ONE integrated picture — connecting threads across journals and illuminating how different areas interact.

Journals:
${ctx || "[No journal entries yet — warmly invite them to share]"}

Your role:
- Answer questions with deep insight drawn from their actual writing
- Notice patterns, contradictions, and growth — especially ACROSS journals
- Offer tailored journaling prompts (prefix with 📝)
- Ask probing, compassionate follow-up questions (prefix with 💭)
- Be warm, specific, and human — never generic or clinical
- Reference specific journals by name when relevant
- Help them see connections they may not have noticed themselves

When responding: be genuine, draw directly from their writing, keep it conversational and warm.`;
}

function buildGuidedPrompt(sessionId, journals) {
  const base = buildSystemPrompt(journals);
  const guides = {
    cbt: `\n\nYou are now running a CBT Thought Record session. Guide them step by step:
1. Ask them to describe a situation that triggered a strong emotion recently
2. Ask what automatic thought came up ("What went through your mind?")
3. Identify the emotion and rate its intensity 0-100
4. Examine the evidence FOR and AGAINST the thought
5. Help them create a balanced alternative thought
6. Re-rate the emotion. Be warm, Socratic, never rushing. One question at a time.`,
    values: `\n\nYou are now running a Values Excavation session. Guide them step by step:
1. Ask them to think of a moment they felt most alive and like themselves
2. Extract what values that moment was expressing
3. Ask where they feel most out of alignment with those values right now
4. Explore what's getting in the way
5. Help them identify one small action that would honour a core value this week. One question at a time.`,
    shadow: `\n\nYou are now running a Shadow Work session. Proceed gently and carefully:
1. Ask them to think of a quality in someone else that bothers or triggers them most
2. Explore how that quality might also exist in them in some form
3. Ask what they most fear others seeing in them
4. Explore what they've had to suppress or hide to be accepted
5. Help them see the gift hidden in their shadow. Be gentle, non-judgmental. One question at a time.`,
    innerchild: `\n\nYou are now running an Inner Child session. Proceed with great care and warmth:
1. Ask them to think of their younger self at a difficult age — what was happening?
2. Ask what that younger self most needed to hear but didn't
3. Invite them to write a short letter to that child
4. Explore where that child's unmet needs might still be running the show today
5. Help them identify how they can begin to meet those needs as an adult. One question at a time.`,
    patterns: `\n\nYou are now running a Pattern Scan. Read ALL the journal entries carefully and then:
1. Identify the 3-5 most significant recurring themes across ALL journals
2. Name the core beliefs you can infer are operating underneath the surface
3. Point out any meaningful connections ACROSS different journals the person may not have noticed
4. Identify one pattern that seems to be shifting or evolving positively
5. Name one pattern that seems to be creating friction or holding them back
6. End with 2-3 specific journaling prompts tailored to what you found

Write this as a warm, insightful report — not bullet points. Like a letter from a therapist who has read everything carefully.`,
  };
  return base + (guides[sessionId] || "");
}

// ─────────────────────────────────────────────
// STORAGE (localStorage for Stackblitz)
// ─────────────────────────────────────────────

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(journals, activeId, theme, messages) {
  try {
    // Save last 40 messages only
    const trimmed = messages.slice(-40);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ journals, activeId, theme, messages: trimmed }));
  } catch {}
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function App() {
  const saved = loadState();

  const [journals, setJournals] = useState(saved?.journals || DEFAULT_JOURNALS);
  const [activeId, setActiveId] = useState(saved?.activeId || "1");
  const [messages, setMessages] = useState(saved?.messages || [WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(saved?.theme || "dark");
  const [panelsOpen, setPanelsOpen] = useState(true);
  const sidebarOpen = panelsOpen;
  const journalOpen = panelsOpen;
  const setSidebarOpen = (v) => setPanelsOpen(v);
  const setJournalOpen = (v) => setPanelsOpen(v);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showGuidedModal, setShowGuidedModal] = useState(false);
  const [sessionText, setSessionText] = useState("");
  const [sessionCopied, setSessionCopied] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📓");
  const [activeSession, setActiveSession] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const t = T[theme];
  const activeJournal = journals.find(j => j.id === activeId) || journals[0];
  const loadedCount = journals.filter(j => j.savedContent.trim()).length;

  // ── PERSIST ──
  useEffect(() => {
    saveState(journals, activeId, theme, messages);
  }, [journals, activeId, theme, messages]);

  // ── SCROLL ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── JOURNAL ACTIONS ──
  const updateContent = (id, content) =>
    setJournals(prev => prev.map(j => j.id === id ? { ...j, content } : j));

  const saveJournal = (id) =>
    setJournals(prev => prev.map(j =>
      j.id === id ? { ...j, savedContent: j.content, lastUpdated: Date.now() } : j
    ));

  const addJournal = () => {
    if (!newName.trim()) return;
    const colors = ["#c9a96e","#a8c4b8","#b8a8c4","#c4a8a8","#a8b8c4","#c4c4a8"];
    const j = { id: genId(), name: newName.trim(), emoji: newEmoji, color: colors[journals.length % colors.length], content: "", savedContent: "", lastUpdated: null };
    setJournals(prev => [...prev, j]);
    setActiveId(j.id);
    setNewName(""); setNewEmoji("📓");
    setShowNewModal(false);
  };

  const deleteJournal = (id) => {
    if (journals.length <= 1) return;
    setJournals(prev => prev.filter(j => j.id !== id));
    if (activeId === id) setActiveId(journals.find(j => j.id !== id)?.id);
  };

  // ── SEND MESSAGE ──
  const sendMsg = useCallback(async (text, sessionId = null) => {
    const content = text || input.trim();
    if (!content || loading) return;
    const userMsg = { role: "user", content };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const sys = sessionId
        ? buildGuidedPrompt(sessionId, journals)
        : buildSystemPrompt(journals);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL, max_tokens: 1500,
          system: sys,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "I'm here. Can you say more?";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went quiet on my end. Try again?" }]);
    } finally { setLoading(false); }
  }, [input, loading, messages, journals]);

  // ── START GUIDED SESSION ──
  const startGuided = (session) => {
    setShowGuidedModal(false);
    setActiveSession(session);
    const opener = {
      cbt: "I'd like to do a CBT thought record with you.",
      values: "I'd like to explore my values with you.",
      shadow: "I'd like to do some shadow work.",
      innerchild: "I'd like to do inner child work.",
      patterns: "Please do a full pattern scan of all my journals.",
    }[session.id];
    sendMsg(opener, session.id);
  };

  // ── SAVE SESSION ──
  const openSaveSession = () => {
    const lines = [
      "═══════════════════════════════════════",
      "SANCTUARY — SESSION EXPORT",
      `Date: ${new Date().toLocaleString()}`,
      "═══════════════════════════════════════", "",
      "── JOURNALS ────────────────────────────", "",
    ];
    journals.forEach(j => {
      lines.push(`${j.emoji} ${j.name.toUpperCase()}`);
      lines.push(j.savedContent.trim() || "[no entries]");
      lines.push("", "---", "");
    });
    lines.push("── CONVERSATION ─────────────────────────", "");
    messages.forEach(m => {
      lines.push(m.role === "user" ? `YOU:\n${m.content}` : `THERAPIST:\n${m.content}`);
      lines.push("");
    });
    lines.push("═══════════════════════════════════════");
    lines.push("Paste this into a new session for full context.");
    setSessionText(lines.join("\n"));
    setShowSessionModal(true);
    setSessionCopied(false);
  };

  // ── FORMAT AI MSG ──
  const fmt = (content) => content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/📝 (.*?)(?=\n|$)/g, `<span style="display:block;font-style:italic;color:${t.promptColor};margin:6px 0;">📝 $1</span>`)
    .replace(/💭 (.*?)(?=\n|$)/g, `<span style="display:block;color:${t.qColor};margin:6px 0;">💭 $1</span>`)
    .replace(/\n/g, "<br/>");

  // ── BUTTON COMPONENT ──
  const OutBtn = ({ children, onClick, style = {} }) => (
    <button onClick={onClick}
      style={{ background: "transparent", border: `1px solid ${t.btnBorder}`, color: t.btnText, fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", padding: "6px 13px", borderRadius: 2, cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap", ...style }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = t.btnHoverBorder; e.currentTarget.style.color = t.btnHoverText; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = t.btnBorder; e.currentTarget.style.color = t.btnText; }}
    >{children}</button>
  );

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <div style={{ display: "flex", height: "100vh", background: t.appBg, overflow: "hidden", fontFamily: "'DM Sans',sans-serif", transition: "background .3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 2px; }
        .jta { font-family:'Cormorant Garamond',serif; font-size:18px; line-height:1.9; color:${t.jText}; background:transparent; border:none; resize:none; width:100%; height:100%; padding:0; outline:none; }
        .jta::placeholder { color:${t.jPlaceholder}; font-style:italic; }
        .cta { font-family:'DM Sans',sans-serif; font-size:14px; font-weight:300; color:${t.iText}; background:transparent; border:none; outline:none; resize:none; width:100%; line-height:1.6; min-height:24px; max-height:100px; overflow-y:auto; }
        .cta::placeholder { color:${t.iPlaceholder}; }
        .fi { font-family:'DM Sans',sans-serif; font-size:14px; color:${t.fieldText}; background:${t.fieldBg}; border:1px solid ${t.fieldBorder}; padding:10px 14px; border-radius:4px; outline:none; width:100%; }
        .fi:focus { border-color:${t.saveBg}; }
        .ji { cursor:pointer; border-radius:6px; transition:background .15s; }
        .ji:hover { background:${t.jHover}; }
        .fi2 { animation: fi2 .35s ease forwards; }
        @keyframes fi2 { from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);} }
        @keyframes pulse { 0%,80%,100%{opacity:.2;transform:scale(.8);}40%{opacity:1;transform:scale(1);} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);} }
        .si { animation: slideIn .22s ease forwards; }
      `}</style>

      {/* ══ SIDEBAR ══════════════════════════════════════════ */}
      {!sidebarOpen ? (
        <div onClick={() => setSidebarOpen(true)}
          style={{ width: 42, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, paddingBottom: 14, gap: 8, background: t.sidebarBg, borderRight: `1px solid ${t.sidebarBorder}`, cursor: "pointer", transition: "background .2s", zIndex: 10 }}
          onMouseEnter={e => e.currentTarget.style.background = t.railHover}
          onMouseLeave={e => e.currentTarget.style.background = t.sidebarBg}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={t.hSub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 4 }}>
            <polyline points="3,2 7,5 3,8" />
          </svg>
          {journals.map(j => (
            <div key={j.id} title={j.name}
              onClick={e => { e.stopPropagation(); setActiveId(j.id); setSidebarOpen(true); setJournalOpen(true); }}
              style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, background: j.id === activeId ? t.ajBg : "transparent", border: j.id === activeId ? `1px solid ${t.ajBorder}` : "1px solid transparent", position: "relative", flexShrink: 0 }}>
              {j.emoji}
              {j.savedContent.trim() && <span style={{ position: "absolute", bottom: 1, right: 1, width: 5, height: 5, borderRadius: "50%", background: j.color, boxShadow: `0 0 4px ${j.color}99` }} />}
            </div>
          ))}
          <div style={{ marginTop: "auto", fontSize: 16, color: t.hSub }}>+</div>
        </div>
      ) : (
        <div className="si" style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", background: t.sidebarBg, borderRight: `1px solid ${t.sidebarBorder}`, transition: "background .3s", zIndex: 10 }}>
          <div style={{ padding: "18px 14px 12px", borderBottom: `1px solid ${t.sidebarBorder}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 400, color: t.hTitle }}>My Journals</div>
              <div style={{ fontSize: 11, color: t.hSub, letterSpacing: ".07em", textTransform: "uppercase", marginTop: 2 }}>{journals.length} journal{journals.length !== 1 ? "s" : ""}</div>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px 4px", color: t.hSub }}>
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="7,2 3,5 7,8" />
              </svg>
            </button>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
            {journals.map((j, idx) => (
              <div key={j.id} className="ji si" style={{ animationDelay: `${idx * 0.04}s`, padding: "9px 10px", marginBottom: 2, background: j.id === activeId ? t.ajBg : "transparent", border: j.id === activeId ? `1px solid ${t.ajBorder}` : "1px solid transparent" }}
                onClick={() => { setActiveId(j.id); setJournalOpen(true); }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{j.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: j.id === activeId ? 500 : 400, color: j.id === activeId ? t.jItemActive : t.jItemText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{j.name}</div>
                      <div style={{ fontSize: 10, color: t.hSub, marginTop: 1 }}>{fmtDate(j.lastUpdated)}</div>
                    </div>
                  </div>
                  {j.savedContent.trim() && <span style={{ width: 6, height: 6, borderRadius: "50%", background: j.color, flexShrink: 0, boxShadow: `0 0 5px ${j.color}88` }} />}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "10px 8px 14px", borderTop: `1px solid ${t.sidebarBorder}`, display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={() => setShowNewModal(true)} style={{ width: "100%", background: t.newBtnBg, border: `1px solid ${t.newBtnBorder}`, color: t.newBtnText, fontFamily: "'DM Sans',sans-serif", fontSize: 12, padding: "8px 0", borderRadius: 4, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>+</span> New Journal
            </button>
            <button onClick={() => setShowGuidedModal(true)} style={{ width: "100%", background: t.sessionBg, border: `1px solid ${t.sessionBorder}`, color: t.sessionText, fontFamily: "'DM Sans',sans-serif", fontSize: 11, padding: "8px 0", borderRadius: 4, cursor: "pointer", transition: "all .2s", letterSpacing: ".05em" }}>
              ✦ Guided Session
            </button>
            <button onClick={openSaveSession} style={{ width: "100%", background: t.sessionBg, border: `1px solid ${t.sessionBorder}`, color: t.sessionText, fontFamily: "'DM Sans',sans-serif", fontSize: 11, padding: "7px 0", borderRadius: 4, cursor: "pointer", transition: "all .2s", letterSpacing: ".06em", textTransform: "uppercase" }}>
              ↓ Save Session
            </button>
          </div>
        </div>
      )}

      {/* ══ JOURNAL PANEL ══════════════════════════════════ */}
      {!journalOpen ? (
        <div onClick={() => setJournalOpen(true)}
          style={{ width: 42, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: t.jBg, borderRight: `1px solid ${t.divider}`, cursor: "pointer", transition: "background .2s", position: "relative" }}
          onMouseEnter={e => e.currentTarget.style.background = t.railHover}
          onMouseLeave={e => e.currentTarget.style.background = t.jBg}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-90deg)", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", pointerEvents: "none" }}>
            <span style={{ fontSize: 13 }}>{activeJournal.emoji}</span>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: t.hSub, letterSpacing: ".06em" }}>{activeJournal.name}</span>
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke={t.hSub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,2 7,5 3,8" /></svg>
          </div>
          {activeJournal.savedContent.trim() && <span style={{ position: "absolute", bottom: 14, width: 5, height: 5, borderRadius: "50%", background: activeJournal.color, boxShadow: `0 0 5px ${activeJournal.color}88` }} />}
        </div>
      ) : (
        <div style={{ width: "42%", minWidth: 300, display: "flex", flexDirection: "column", background: t.jBg, borderRight: `1px solid ${t.divider}`, transition: "background .3s", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 26px", borderBottom: `1px solid ${t.hBorder}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 19 }}>{activeJournal.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 400, color: t.hTitle }}>{activeJournal.name}</div>
                <div style={{ fontSize: 10, color: t.hSub, letterSpacing: ".07em", textTransform: "uppercase", marginTop: 1 }}>
                  {activeJournal.savedContent.trim() ? `saved ${fmtDate(activeJournal.lastUpdated)}` : "unsaved"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <OutBtn onClick={() => setTheme(m => m === "dark" ? "light" : "dark")}>{theme === "dark" ? "☀️" : "🌙"}</OutBtn>
              <OutBtn onClick={() => setJournalOpen(false)}>
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 3 }}><polyline points="7,2 3,5 7,8" /></svg>
                Hide
              </OutBtn>
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "22px 34px 0" }}>
            <textarea className="jta"
              placeholder={`Write or paste your ${activeJournal.name} entries here...\n\nAny format — dates, bullets, stream of consciousness.\nThe more you share, the richer the insight.`}
              value={activeJournal.content}
              onChange={e => updateContent(activeJournal.id, e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 34px 15px", borderTop: `1px solid ${t.fBorder}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: t.wordCount }}>{wordCount(activeJournal.content) || "empty"} {wordCount(activeJournal.content) ? "words" : ""}</span>
              {journals.length > 1 && <button onClick={() => deleteJournal(activeJournal.id)} style={{ background: "transparent", border: "none", color: t.wordCount, fontSize: 11, cursor: "pointer", opacity: .55 }}>delete</button>}
            </div>
            <button onClick={() => saveJournal(activeJournal.id)}
              style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 400, letterSpacing: ".09em", textTransform: "uppercase", background: (activeJournal.savedContent === activeJournal.content && activeJournal.savedContent) ? (theme === "dark" ? "#2a2520" : "#e0dbd4") : t.saveBg, border: "none", color: (activeJournal.savedContent === activeJournal.content && activeJournal.savedContent) ? t.wordCount : t.saveText, padding: "9px 24px", borderRadius: 2, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { if (!(activeJournal.savedContent === activeJournal.content && activeJournal.savedContent)) e.currentTarget.style.background = t.saveHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = (activeJournal.savedContent === activeJournal.content && activeJournal.savedContent) ? (theme === "dark" ? "#2a2520" : "#e0dbd4") : t.saveBg; }}>
              {(activeJournal.savedContent === activeJournal.content && activeJournal.savedContent) ? "✓ Saved" : "Save & Load"}
            </button>
          </div>
        </div>
      )}

      {/* ══ CHAT ════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: t.chatBg, transition: "background .3s", minWidth: 0 }}>
        <div style={{ padding: "13px 20px", borderBottom: `1px solid ${t.chatBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🌿</div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 400, color: t.chatTitle }}>Your Therapist</div>
              <div style={{ fontSize: 10, color: t.chatSub, display: "flex", alignItems: "center", gap: 5 }}>
                {loadedCount > 0
                  ? <><span style={{ width: 5, height: 5, borderRadius: "50%", background: t.statusBg, display: "inline-block", boxShadow: `0 0 5px ${t.statusGlow}` }} /><span style={{ color: t.statusText }}>{loadedCount} journal{loadedCount > 1 ? "s" : ""} loaded</span></>
                  : <span style={{ color: t.noStatus }}>no journals loaded yet</span>}
                {activeSession && <span style={{ color: t.promptColor, marginLeft: 4 }}>· {activeSession.emoji} {activeSession.name}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {activeSession && <OutBtn onClick={() => setActiveSession(null)}>End Session</OutBtn>}
            <OutBtn onClick={() => setShowGuidedModal(true)}>✦ Sessions</OutBtn>
            <OutBtn onClick={openSaveSession}>↓ Save</OutBtn>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} className="fi2" style={{ display: "flex", flexDirection: "column" }}>
              {msg.role === "user"
                ? <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 300, lineHeight: 1.7, color: t.uText, background: t.uBg, border: `1px solid ${t.uBorder}`, borderRadius: "16px 16px 4px 16px", padding: "10px 15px", maxWidth: "80%", alignSelf: "flex-end" }}>{msg.content}</div>
                : <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 300, lineHeight: 1.8, color: t.aText, maxWidth: "95%", alignSelf: "flex-start" }} dangerouslySetInnerHTML={{ __html: fmt(msg.content) }} />}
            </div>
          ))}
          {loading && (
            <div className="fi2" style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}>
              {[0, 0.2, 0.4].map((d, i) => <span key={i} style={{ width: 6, height: 6, background: t.dotBg, borderRadius: "50%", display: "inline-block", margin: "0 2px", animation: `pulse 1.2s ease-in-out ${d}s infinite` }} />)}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: "0 20px 8px", display: "flex", gap: 5, flexWrap: "wrap", flexShrink: 0 }}>
          {QUICK_CHIPS.map(q => (
            <button key={q} onClick={() => sendMsg(q)}
              style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 300, color: t.chipText, background: "transparent", border: `1px solid ${t.chipBorder}`, padding: "5px 12px", borderRadius: 20, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.chipHoverBorder; e.currentTarget.style.color = t.chipHoverText; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.chipBorder; e.currentTarget.style.color = t.chipText; }}
            >{q}</button>
          ))}
        </div>

        <div style={{ padding: "7px 20px 15px", borderTop: `1px solid ${t.chatBorder}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, background: t.iBg, border: `1px solid ${t.iBorder}`, borderRadius: 13, padding: "10px 12px" }}>
            <textarea ref={inputRef} className="cta"
              placeholder="Ask about patterns across your journals, or just share how you're feeling..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              rows={1}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
            />
            <button onClick={() => sendMsg()} disabled={loading || !input.trim()}
              style={{ background: (loading || !input.trim()) ? t.sendDisabled : t.sendBg, border: "none", color: t.sendText, width: 32, height: 32, borderRadius: "50%", cursor: (loading || !input.trim()) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div style={{ fontSize: 9, color: t.privacyText, textAlign: "center", marginTop: 6, letterSpacing: ".04em" }}>
            All journals are private — only shared with this conversation
          </div>
        </div>
      </div>

      {/* ══ NEW JOURNAL MODAL ══════════════════════════════ */}
      {showNewModal && (
        <div style={{ position: "fixed", inset: 0, background: t.overlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
          <div className="fi2" style={{ background: t.modalBg, border: `1px solid ${t.modalBorder}`, borderRadius: 8, padding: "26px 30px", width: 320, maxWidth: "90vw" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 400, color: t.hTitle, marginBottom: 18 }}>New Journal</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, color: t.hSub, letterSpacing: ".07em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Name</label>
              <input className="fi" placeholder="e.g. Relationships, Dreams, Health..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addJournal()} autoFocus />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: t.hSub, letterSpacing: ".07em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Emoji</label>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {["📓","❤️","🌙","💪","🎯","✨","🌱","💡","🔥","🧘","📊","🗝️","🌊","🦋","⚡"].map(em => (
                  <button key={em} onClick={() => setNewEmoji(em)} style={{ width: 34, height: 34, borderRadius: 6, fontSize: 16, border: `2px solid ${newEmoji === em ? t.saveBg : t.modalBorder}`, background: newEmoji === em ? t.ajBg : "transparent", cursor: "pointer", transition: "all .15s" }}>{em}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowNewModal(false)} style={{ flex: 1, fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: ".07em", textTransform: "uppercase", background: "transparent", border: `1px solid ${t.btnBorder}`, color: t.btnText, padding: "9px 0", borderRadius: 2, cursor: "pointer" }}>Cancel</button>
              <button onClick={addJournal} disabled={!newName.trim()} style={{ flex: 2, fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: ".07em", textTransform: "uppercase", background: newName.trim() ? t.saveBg : t.sendDisabled, border: "none", color: newName.trim() ? t.saveText : t.hSub, padding: "9px 0", borderRadius: 2, cursor: newName.trim() ? "pointer" : "not-allowed", transition: "all .2s" }}>Create Journal</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ GUIDED SESSION MODAL ══════════════════════════ */}
      {showGuidedModal && (
        <div style={{ position: "fixed", inset: 0, background: t.overlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setShowGuidedModal(false); }}>
          <div className="fi2" style={{ background: t.modalBg, border: `1px solid ${t.modalBorder}`, borderRadius: 8, padding: "26px 30px", width: 380, maxWidth: "92vw" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 400, color: t.hTitle, marginBottom: 6 }}>Guided Sessions</div>
            <div style={{ fontSize: 11, color: t.hSub, marginBottom: 18, lineHeight: 1.6 }}>The AI will walk you through a structured therapeutic process, one question at a time.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {GUIDED_SESSIONS.map(s => (
                <button key={s.id} onClick={() => startGuided(s)}
                  style={{ background: t.ajBg, border: `1px solid ${t.ajBorder}`, borderRadius: 6, padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all .2s", display: "flex", alignItems: "center", gap: 12 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.saveBg}
                  onMouseLeave={e => e.currentTarget.style.borderColor = t.ajBorder}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{s.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: t.hTitle, marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: t.hSub }}>{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowGuidedModal(false)} style={{ width: "100%", marginTop: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: ".07em", textTransform: "uppercase", background: "transparent", border: `1px solid ${t.btnBorder}`, color: t.btnText, padding: "9px 0", borderRadius: 2, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ══ SESSION EXPORT MODAL ══════════════════════════ */}
      {showSessionModal && (
        <div style={{ position: "fixed", inset: 0, background: t.overlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setShowSessionModal(false); }}>
          <div className="fi2" style={{ background: t.modalBg, border: `1px solid ${t.modalBorder}`, borderRadius: 8, padding: "22px 26px", width: 540, maxWidth: "92vw", maxHeight: "80vh", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 400, color: t.hTitle }}>Session Export</div>
              <button onClick={() => setShowSessionModal(false)} style={{ background: "transparent", border: "none", color: t.hSub, cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
            <div style={{ fontSize: 11, color: t.hSub, lineHeight: 1.6 }}>Copy and save somewhere safe. Paste into a future session to restore full context.</div>
            <textarea readOnly value={sessionText} onClick={e => e.target.select()}
              style={{ fontFamily: "monospace", fontSize: 10, lineHeight: 1.6, color: t.jText, background: t.fieldBg, border: `1px solid ${t.fieldBorder}`, borderRadius: 4, padding: "11px 13px", resize: "none", outline: "none", flex: 1, minHeight: 240, overflowY: "auto" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { navigator.clipboard.writeText(sessionText); setSessionCopied(true); setTimeout(() => setSessionCopied(false), 2500); }}
                style={{ flex: 2, fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", background: sessionCopied ? (theme === "dark" ? "#1a3a1a" : "#d4edda") : t.saveBg, border: "none", color: sessionCopied ? (theme === "dark" ? "#6ab87a" : "#2e8b57") : t.saveText, padding: "10px 0", borderRadius: 2, cursor: "pointer", transition: "all .2s" }}>
                {sessionCopied ? "✓ Copied!" : "Copy to Clipboard"}
              </button>
              <button onClick={() => setShowSessionModal(false)} style={{ flex: 1, fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: ".07em", textTransform: "uppercase", background: "transparent", border: `1px solid ${t.btnBorder}`, color: t.btnText, padding: "10px 0", borderRadius: 2, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
