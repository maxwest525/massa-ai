"""Tests for the risk guard."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from engine.core.risk import RiskGuard
from engine.models.signal import Signal, SignalType

LIMITS = {
    "max_position_pct": 10.0,
    "daily_loss_limit": 3.0,
    "max_open_trades": 2,
}
PORTFOLIO = 10_000.0


def make_signal(side=SignalType.BUY) -> Signal:
    return Signal(type=side, confidence=1.0)


def test_allows_normal_signal():
    guard = RiskGuard()
    allowed, reason = guard.check(make_signal(), "s1", LIMITS, PORTFOLIO)
    assert allowed
    assert reason == ""


def test_blocks_when_max_open_trades_reached():
    guard = RiskGuard()
    guard.record_open("s1")
    guard.record_open("s1")
    allowed, reason = guard.check(make_signal(), "s1", LIMITS, PORTFOLIO)
    assert not allowed
    assert "max open" in reason.lower()


def test_blocks_when_daily_loss_exceeded():
    guard = RiskGuard()
    # daily_loss_limit = 3% of 10_000 = 300
    guard.record_close("s1", pnl=-350.0)
    allowed, reason = guard.check(make_signal(), "s1", LIMITS, PORTFOLIO)
    assert not allowed
    assert "daily loss" in reason.lower()


def test_close_signal_bypasses_max_open_check():
    guard = RiskGuard()
    guard.record_open("s1")
    guard.record_open("s1")
    # CLOSE signals should not be blocked by max_open_trades
    allowed, reason = guard.check(make_signal(SignalType.CLOSE), "s1", LIMITS, PORTFOLIO)
    assert allowed


def test_kill_switch_blocks_all(monkeypatch):
    monkeypatch.setenv("KILL_SWITCH", "true")
    guard = RiskGuard()
    allowed, reason = guard.check(make_signal(), "s1", LIMITS, PORTFOLIO)
    assert not allowed
    assert "KILL_SWITCH" in reason


def test_stats_reset_tracking():
    guard = RiskGuard()
    guard.record_open("s1")
    guard.record_close("s1", pnl=50.0)
    stats = guard.get_daily_stats("s1")
    assert stats["open_trades"] == 0
    assert stats["realized_pnl"] == 50.0
