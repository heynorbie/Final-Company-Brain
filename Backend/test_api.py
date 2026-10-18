import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
model = os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3.5-lightning:free")

if not api_key:
    raise SystemExit("ERROR: OPENROUTER_API_KEY .env se load nahi hui.")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
    timeout=25.0,
    max_retries=0,
    default_headers={
        "HTTP-Referer": os.getenv("OPENROUTER_SITE_URL", "http://localhost:8501"),
        "X-Title": "Company Brain AI",
    },
)

print("Testing OpenRouter...", flush=True)
print("Model:", model, flush=True)
try:
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role":"system","content":"You are a helpful assistant. Return only a short final answer. Do not output reasoning."},
            {"role":"user","content":"Reply exactly: Hello Company Brain!"}
        ],
        max_tokens=700,
        extra_body={"reasoning":{"enabled":False}},
    )
    choice = response.choices[0]
    print("MODEL:", response.model)
    print("FINISH REASON:", choice.finish_reason)
    print("CONTENT:", repr(choice.message.content))
    if choice.message.content and choice.message.content.strip():
        print("API TEST PASSED")
    else:
        print("No final answer returned. Try a different available OpenRouter model.")
except Exception as exc:
    print("API ERROR:", type(exc).__name__, str(exc))
