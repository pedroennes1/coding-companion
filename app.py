import os
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
from openai import OpenAI

# Load environment variables from .env
load_dotenv()

app = Flask(__name__, template_folder="templates", static_folder="static")

# Get API key safely
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError("OPENAI_API_KEY not found. Check your .env file.")

client = OpenAI(api_key=api_key)

MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

SYSTEM_PROMPT = """
You are Coding Companion — a sharp, friendly debugging assistant.

When given code or an error:
1) Explain what's wrong
2) Explain why it happens
3) Provide corrected code
4) Give one quick tip to avoid it in the future

Be clear and concise.
"""

messages = [{"role": "system", "content": SYSTEM_PROMPT}]

@app.get("/")
def index():
    return render_template("index.html")

@app.post("/chat")
def chat():
    user_input = (request.form.get("query") or "").strip()

    if not user_input:
        return jsonify({"response": "Send me code or an error and I’ll help debug it."}), 400

    try:
        messages.append({"role": "user", "content": user_input})

        completion = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.3,
            max_tokens=600
        )

        assistant_reply = completion.choices[0].message.content

        messages.append({"role": "assistant", "content": assistant_reply})

        return jsonify({"response": assistant_reply})

    except Exception as e:
        return jsonify({"response": f"API error: {e}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)