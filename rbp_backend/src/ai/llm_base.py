import os
from dotenv import load_dotenv
import requests
import logging
import re
import json

# load .env into environment for modules that import LLMClient directly
load_dotenv()
logger = logging.getLogger(__name__)


def _mask_url_key(u: str) -> str:
    # mask api key in query param for safe logging/display
    return re.sub(r'([?&]key=)[^&]+', r'\1***', u)


class LLMClient:
    """Lightweight LLM client with optional Google Generative API support.

    Behavior:
    - If `GEMINI_API_KEY` is set in environment, uses Google's Generative API.
    - The model can be selected with the `GEMINI_MODEL` env var (e.g. `gemini` or `text-bison-001`).
    - Otherwise falls back to a simple local deterministic responder.
    """

    def __init__(self, api_key: str = None, model: str = None):
        # load key from env if not provided
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        # allow overriding model via env or constructor; default to text-bison-001
        self.model = model or os.getenv("GEMINI_MODEL") or "text-bison-001"

    def completion(self, prompt: str, max_tokens: int = 512):
        """Return a text completion. Non-streaming for simplicity."""
        if not self.api_key:
            # Fallback: deterministic simple reply for intent extraction
            if "show" in prompt.lower() and "product" in prompt.lower():
                return "INTENT:SHOW_PRODUCTS"
            if "variant" in prompt.lower():
                return "INTENT:SHOW_VARIANTS"
            if "add" in prompt.lower() and "cart" in prompt.lower():
                return "INTENT:ADD_TO_CART"
            if "suggest" in prompt.lower() or "hospital" in prompt.lower():
                return "INTENT:SUGGEST_BULK"
            return "INTENT:CHAT"

        # NOTE: This is a minimal example call shape for Google's Generative API.
        # Choose auth method depending on the type of key provided:
        # - API keys (start with 'AIza') must be passed as `?key=...`
        # - OAuth/service-account access tokens should be passed as Bearer tokens
        # You should verify endpoint and payload shape against current Google docs.
        # Build candidate endpoints to try — API keys (AIza...) often work with
        # the v1 `models/{model}:generateText` endpoint. We'll try v1 first,
        # then v1beta2 as a fallback. For bearer tokens the same endpoints are
        # attempted without the `?key=` query param.
        model = getattr(self, "model", "text-bison-001")

        # Discover available models and their capabilities (if key allows listing)
        model_info = None
        try:
            if isinstance(self.api_key, str) and self.api_key.startswith("AIza"):
                list_url = f"https://generativelanguage.googleapis.com/v1/models?key={self.api_key}"
                rl = requests.get(list_url, timeout=6)
            else:
                list_url = f"https://generativelanguage.googleapis.com/v1/models"
                rl = requests.get(list_url, headers={"Authorization": f"Bearer {self.api_key}"}, timeout=6) if self.api_key else None

            if rl is not None and rl.status_code == 200:
                mdata = rl.json() or {}
                models_list = mdata.get("models") or []
                # build lookup shortname -> model metadata
                models_by_short = {}
                for m in models_list:
                    full_name = m.get("name") or m.get("id") or ""
                    short = full_name.split('/')[-1]
                    models_by_short[short] = m

                # if configured model not present, pick a sensible available fallback
                if model not in models_by_short and models_by_short:
                    for pref in ("gemini-2.0", "gemini-1.5", "gemini-2.5", "text-bison-001", "chat-bison-001"):
                        found = next((n for n in models_by_short.keys() if pref in n), None)
                        if found:
                            model = found
                            break
                    else:
                        model = next(iter(models_by_short.keys()))

                model_info = models_by_short.get(model)
        except Exception:
            # discovery best-effort — ignore failures
            model_info = None

        # build ordered list of operations to try (prefer model-supported methods but always try common fallbacks)
        preferred_ops = ["generateText", "generateMessage", "generateContent"]
        ops_to_try = []
        supported_methods = []
        if model_info:
            supported_methods = model_info.get("supportedGenerationMethods") or []
            # add supported methods in preference order first
            for p in preferred_ops:
                if p in supported_methods:
                    ops_to_try.append(p)
            # then append remaining fallbacks
            for p in preferred_ops:
                if p not in ops_to_try:
                    ops_to_try.append(p)
        else:
            ops_to_try = preferred_ops[:]

        last_error = None
        attempts = []

        # Try each operation (generateText -> generateMessage -> generateContent) because
        # some keys/models expose different endpoints or expect different body shapes.
        for op in ops_to_try:
            # prepare request body candidates according to operation
            if op == "generateMessage":
                body_candidates = [
                    {
                        "messages": [{"author": "user", "content": [{"type": "text", "text": prompt}]}],
                        "temperature": 0.2,
                        "candidateCount": 1,
                    }
                ]
            elif op == "generateContent":
                # include several variants and also try a 'prompt' fallback (some endpoints accept legacy text shape)
                body_candidates = [
                    {"contents": [{"parts": [{"text": prompt}]}]},
                    {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.2, "maxOutputTokens": max_tokens}},
                    # support for v1beta endpoints which might expect different top-level keys
                    {"content": [{"type": "text", "text": prompt}], "candidateCount": 1},
                ]
            else:
                # generateText (default/simple shape)
                body_candidates = [
                    {"prompt": {"text": prompt}, "temperature": 0.2, "maxOutputTokens": max_tokens}
                ]

            # build candidate endpoints using the selected operation
            candidate_urls = []
            if isinstance(self.api_key, str) and self.api_key.startswith("AIza"):
                candidate_urls.append(f"https://generativelanguage.googleapis.com/v1/models/{model}:{op}?key={self.api_key}")
                candidate_urls.append(f"https://generativelanguage.googleapis.com/v1beta2/models/{model}:{op}?key={self.api_key}")
                # also try generateMessage endpoint as a fallback (some models expose only message-style endpoints)
                candidate_urls.append(f"https://generativelanguage.googleapis.com/v1/models/{model}:generateMessage?key={self.api_key}")
            else:
                candidate_urls.append(f"https://generativelanguage.googleapis.com/v1/models/{model}:{op}")
                candidate_urls.append(f"https://generativelanguage.googleapis.com/v1beta2/models/{model}:{op}")
                candidate_urls.append(f"https://generativelanguage.googleapis.com/v1/models/{model}:generateMessage")

            # try each candidate URL and each body variant
            for url in candidate_urls:
                for body in body_candidates:
                    try:
                        # set headers depending on API key vs bearer token
                        headers = {"Content-Type": "application/json"}
                        if not (isinstance(self.api_key, str) and self.api_key.startswith("AIza")) and self.api_key:
                            headers["Authorization"] = f"Bearer {self.api_key}"

                        logger.info(
                            "LLMClient -> trying url=%s op=%s model=%s headers=%s body_keys=%s",
                            _mask_url_key(url),
                            op,
                            getattr(self, "model", None),
                            list(headers.keys()),
                            list(body.keys()),
                        )

                        r = requests.post(url, json=body, headers=headers, timeout=15)
                        r.raise_for_status()
                        resp = r.json()

                        # record successful attempt
                        attempts.append({"url": _mask_url_key(url), "status": r.status_code, "body": json.dumps(resp)[:1000], "request": json.dumps(body)[:1000], "op": op})

                        # Attempt to extract sensible text from common response shapes
                        text = ""
                        if isinstance(resp, dict):
                            candidates = resp.get("candidates") or []
                            if candidates:
                                parts = []
                                for c in candidates:
                                    if isinstance(c, dict):
                                        if isinstance(c.get("text"), str):
                                            parts.append(c.get("text"))
                                            continue

                                        content = c.get("content") or c.get("output") or c.get("response")

                                        if isinstance(content, str):
                                            parts.append(content)
                                        elif isinstance(content, dict):
                                            # handle {'parts': [{'text': '...'}]}
                                            c_parts = content.get("parts")
                                            if isinstance(c_parts, list):
                                                for p_item in c_parts:
                                                    if isinstance(p_item, dict) and p_item.get("text"):
                                                        parts.append(p_item.get("text"))
                                            elif isinstance(content.get("text"), str):
                                                parts.append(content.get("text"))
                                            else:
                                                parts.append(json.dumps(content))
                                        elif isinstance(content, list):
                                            for item in content:
                                                if isinstance(item, str):
                                                    parts.append(item)
                                                elif isinstance(item, dict):
                                                    if isinstance(item.get("text"), str):
                                                        parts.append(item.get("text"))
                                                    elif isinstance(item.get("output_text"), str):
                                                        parts.append(item.get("output_text"))
                                                    elif isinstance(item.get("parts"), list):
                                                        for p_item in item["parts"]:
                                                            if isinstance(p_item, dict) and p_item.get("text"):
                                                                parts.append(p_item.get("text"))
                                                    else:
                                                        parts.append(json.dumps(item))
                                        else:
                                            parts.append(str(content))
                                    elif isinstance(c, str):
                                        parts.append(c)

                                text = "\n".join([p for p in parts if p])

                            if not text:
                                out = resp.get("output") or resp.get("response") or resp.get("result") or {}
                                if isinstance(out, dict):
                                    if isinstance(out.get("text"), str):
                                        text = out.get("text")
                                    elif isinstance(out.get("content"), list):
                                        texts = []
                                        for block in out.get("content", []):
                                            if isinstance(block, dict) and isinstance(block.get("text"), str):
                                                texts.append(block.get("text"))
                                        text = "\n".join(texts)
                                if not text:
                                    text = resp.get("content", "") or resp.get("outputText", "") or resp.get("response", "")

                        if not text:
                            raise ValueError("Gemini API returned an empty or unrecognized response.")

                        return (text or "").strip()

                    except requests.exceptions.HTTPError as e:
                        resp = getattr(e, "response", None)
                        status = resp.status_code if resp is not None else "HTTPError"
                        body_text = resp.text if resp is not None else str(e)
                        logger.warning("LLMClient HTTP error for url=%s op=%s (body-keys=%s): %s", _mask_url_key(url), op, list(body.keys()), body_text)
                        attempts.append({"url": _mask_url_key(url), "status": status, "body": body_text[:1000], "request": json.dumps(body)[:1000], "op": op})
                        last_error = f"Error: Gemini API HTTP {status}: {body_text}"
                        # try next candidate body / url / op
                        continue
                    except requests.exceptions.RequestException as e:
                        logger.exception("LLMClient request failed for url=%s op=%s (body-keys=%s)", _mask_url_key(url), op, list(body.keys()))
                        attempts.append({"url": _mask_url_key(url), "status": "request-failed", "body": str(e)[:1000], "request": json.dumps(body)[:1000], "op": op})
                        last_error = f"Error: Failed to connect to Gemini API ({str(e)})"
                        continue
                    except ValueError as ve:
                        logger.warning("LLMClient value error for url=%s op=%s (body-keys=%s): %s", _mask_url_key(url), op, list(body.keys()), ve)
                        attempts.append({"url": _mask_url_key(url), "status": "invalid-response", "body": str(ve)[:1000], "request": json.dumps(body)[:1000], "op": op})
                        last_error = f"Error: {str(ve)}"
                        continue
                    except Exception as e:
                        logger.exception("LLMClient unexpected error for url=%s op=%s (body-keys=%s)", _mask_url_key(url), op, list(body.keys()))
                        attempts.append({"url": _mask_url_key(url), "status": "exception", "body": str(e)[:1000], "request": json.dumps(body)[:1000], "op": op})
                        last_error = f"Error: An unexpected error occurred ({str(e)})"
                        continue

        # if we reach here, all candidate endpoints failed — return detailed diagnostics
        detail = {"message": last_error, "attempts": attempts}
        try:
            return f"Error: Gemini API call failed — diagnostics: {json.dumps(detail)}"
        except Exception:
            return last_error or "Error: Gemini API call failed (no endpoints succeeded)"

    def extract_json(self, prompt: str, max_tokens: int = 512, retries: int = 1):
        """Ask the LLM to return a JSON object. Attempts to parse common noisy outputs.

        Returns a Python object (dict/list) or None on failure.
        """
        # Prefer explicit instruction to output only JSON
        instruct = (
            "Please respond with ONLY a valid JSON object (no surrounding markdown or text). "
            + prompt
        )

        for _ in range(max(1, retries)):
            raw = self.completion(instruct, max_tokens=max_tokens)
            if not raw:
                continue
            # try direct parse
            try:
                import json

                return json.loads(raw)
            except Exception:
                # try to extract the first JSON blob from the text
                mstart = raw.find("{")
                mend = raw.rfind("}")
                if mstart != -1 and mend != -1 and mend > mstart:
                    snippet = raw[mstart : mend + 1]
                    try:
                        import json

                        return json.loads(snippet)
                    except Exception:
                        pass
                # fallback: give up for this attempt
                continue

        return None

