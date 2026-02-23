console.log("app.js loaded ✅");

const form = document.getElementById("chatForm");
const input = document.getElementById("query");
const chat = document.getElementById("chat");
const sendBtn = document.getElementById("sendBtn");

// ✅ Sprite element
const sprite = document.getElementById("sprite");

// ✅ Sprite filenames in /static/
const SPRITE_IDLE = "/static/coding-companion.png";
const SPRITE_THINKING = "/static/thinking.png";
const SPRITE_DONE = "/static/done.png";

function setSprite(src) {
  if (!sprite) {
    console.warn("No sprite element found.");
    return;
  }
  sprite.style.opacity = 0;
  setTimeout(() => {
    // cache-bust image swaps (helps Safari)
    sprite.src = `${src}?v=${Date.now()}`;
    sprite.style.opacity = 1;
  }, 120);
}

function addBubble(text, who) {
  const div = document.createElement("div");
  div.className = `bubble ${who}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

// Enter to send, Shift+Enter for newline
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

async function postChat(message) {
  const body = new URLSearchParams();
  body.set("query", message);

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) throw new Error("Request failed");
  const data = await res.json();
  return data.response || "(No response)";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addBubble(text, "user");
  input.value = "";
  sendBtn.disabled = true;

  // 🧠 Thinking sprite at request start
  setSprite(SPRITE_THINKING);

  // typing bubble
  const typing = document.createElement("div");
  typing.className = "bubble bot typing";
  typing.innerHTML = `<span class="dots"><span></span><span></span><span></span></span>`;
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  try {
    const reply = await postChat(text);
    typing.remove();
    addBubble(reply, "bot");

    // ✅ Done sprite when response arrives
    setSprite(SPRITE_DONE);

    // 🔁 Back to idle after 2 seconds
    setTimeout(() => setSprite(SPRITE_IDLE), 2000);
  } catch (err) {
    console.error(err);
    typing.remove();
    addBubble("⚠️ I hit an error calling the API. Check your Flask terminal output.", "bot");
    setSprite(SPRITE_IDLE);
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});

// On initial load
setSprite(SPRITE_IDLE);
