import os
import time
from typing import Any

from openai import OpenAI


class LLMResult:
    def __init__(
        self,
        content: str,
        tokens: int,
        latency_ms: int,
        cost: float,
        model: str,
        mocked: bool = False,
    ):
        self.content = content
        self.tokens = tokens
        self.latency_ms = latency_ms
        self.cost = cost
        self.model = model
        self.mocked = mocked


# Approximate gpt-4o-mini pricing (per 1M tokens)
INPUT_COST_PER_TOKEN = 0.15 / 1_000_000
OUTPUT_COST_PER_TOKEN = 0.60 / 1_000_000


def estimate_cost(prompt_tokens: int, completion_tokens: int) -> float:
    return prompt_tokens * INPUT_COST_PER_TOKEN + completion_tokens * OUTPUT_COST_PER_TOKEN


def get_client() -> OpenAI | None:
    api_key = os.getenv("LLM_API_KEY", "").strip()
    if not api_key:
        return None
    base_url = os.getenv("LLM_BASE_URL") or None
    return OpenAI(api_key=api_key, base_url=base_url)


def default_model() -> str:
    return os.getenv("LLM_MODEL", "gpt-4o-mini")


def mock_response(user_message: str, model: str) -> LLMResult:
    lowered = user_message.lower()
    if "password" in lowered or "reset" in lowered:
        content = (
            "I can help you reset your password. Please visit Settings → Security → Reset Password, "
            "or click the 'Forgot password' link on the login page. You'll receive a reset email within "
            "a few minutes. If you don't see it, check your spam folder."
        )
    elif "invoice" in lowered or "billing" in lowered or "higher" in lowered:
        content = (
            "I looked into your recent invoice. The increase this month is typically due to a plan upgrade, "
            "add-on usage, or a promotional discount ending. I can walk you through each line item and "
            "help adjust your plan if needed."
        )
    elif "cancel" in lowered:
        content = (
            "I'm sorry to hear you'd like to cancel. You can cancel anytime from Billing → Subscription → "
            "Cancel. Your access remains active until the end of the current billing period. "
            "Would you like me to check for retention offers before you proceed?"
        )
    elif "payment" in lowered or "failed" in lowered:
        content = (
            "Sorry your payment failed. Common causes are an expired card, insufficient funds, or a bank "
            "decline. Please update your payment method under Billing → Payment Methods, then retry. "
            "I can also send a payment link if that helps."
        )
    else:
        content = (
            f"Thanks for reaching out. Regarding \"{user_message[:120]}\", I've checked our knowledge base "
            "and your account context. Here's what I recommend: verify your account settings, review the "
            "related help article, and let me know if you'd like me to escalate to a specialist."
        )
    tokens = max(180, len(content.split()) * 2 + 40)
    return LLMResult(
        content=content,
        tokens=tokens,
        latency_ms=620,
        cost=round(estimate_cost(tokens // 2, tokens // 2), 6),
        model=model,
        mocked=True,
    )


def generate(
    user_message: str,
    *,
    system_prompt: str | None = None,
    model: str | None = None,
    temperature: float = 0.2,
    max_tokens: int = 800,
) -> LLMResult:
    model = model or default_model()
    system = system_prompt or (
        "You are a helpful customer support agent for a SaaS product. "
        "Be concise, accurate, and empathetic. Do not invent account-specific facts."
    )
    client = get_client()
    if client is None:
        return mock_response(user_message, model)

    started = time.perf_counter()
    try:
        response = client.chat.completions.create(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_message},
            ],
        )
        latency_ms = int((time.perf_counter() - started) * 1000)
        content = response.choices[0].message.content or ""
        usage = response.usage
        prompt_tokens = usage.prompt_tokens if usage else 0
        completion_tokens = usage.completion_tokens if usage else 0
        total = usage.total_tokens if usage else (prompt_tokens + completion_tokens)
        return LLMResult(
            content=content,
            tokens=total,
            latency_ms=latency_ms,
            cost=round(estimate_cost(prompt_tokens, completion_tokens), 6),
            model=model,
            mocked=False,
        )
    except Exception:
        return mock_response(user_message, model)


def judge_evaluation(trace_input: str, trace_output: str) -> dict[str, Any] | None:
    client = get_client()
    if client is None:
        return None
    prompt = f"""Evaluate this customer support agent response. Return ONLY valid JSON with keys:
faithfulness, relevance, task_completion (floats 0-1) and reasoning (string).

User: {trace_input}
Agent: {trace_output}
"""
    try:
        response = client.chat.completions.create(
            model=default_model(),
            temperature=0,
            max_tokens=300,
            messages=[
                {"role": "system", "content": "You are an evaluation judge. Reply with JSON only."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )
        import json

        return json.loads(response.choices[0].message.content or "{}")
    except Exception:
        return None
