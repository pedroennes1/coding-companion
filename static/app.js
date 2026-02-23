const form = document.getElementById("chatForm");
const input = document.getElementById("query");
const chat = document.getElementById("chat");
const sendBtn = document.getElementById("sendBtn");

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
  } catch (err) {
    typing.remove();
    addBubble("⚠️ I hit an error calling the API. Check your Flask terminal output.", "bot");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});