"""Tests for plugin loader discovery and param management."""

import sys
import types
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

# Make engine importable from repo root
sys.path.insert(0, str(Path(__file__).parent.parent))

from engine.core.loader import PluginLoader, _to_class_name, STRATEGIES_DIR
from engine.core._base import BaseStrategy
from engine.models.signal import Signal, SignalType


# ---------------------------------------------------------------------------
# Unit: helpers
# ---------------------------------------------------------------------------

def test_to_class_name():
    assert _to_class_name("ema_cross") == "EmaCrossStrategy"
    assert _to_class_name("grid") == "GridStrategy"
    assert _to_class_name("mean_revert") == "MeanRevertStrategy"


# ---------------------------------------------------------------------------
# Unit: ema_cross plugin loads correctly
# ---------------------------------------------------------------------------

def test_ema_cross_loads():
    loader = PluginLoader()
    loader.discover()
    assert "ema_cross" in loader.registry, "ema_cross plugin should be discovered"


def test_ema_cross_has_expected_params():
    loader = PluginLoader()
    loader.discover()
    instance = loader.registry["ema_cross"]
    assert hasattr(instance.params, "fast_period")
    assert hasattr(instance.params, "slow_period")
    assert instance.params.fast_period == 9
    assert instance.params.slow_period == 21


def test_ema_cross_schema():
    loader = PluginLoader()
    loader.discover()
    schema = loader.get_schema("ema_cross")
    assert schema is not None
    assert schema["id"] == "ema_cross"
    assert "fast_period" in schema["parameters"]
    assert schema["parameters"]["fast_period"]["min"] == 3


# ---------------------------------------------------------------------------
# Unit: update_param
# ---------------------------------------------------------------------------

def test_update_param_changes_live_instance():
    loader = PluginLoader()
    loader.discover()
    loader.update_param("ema_cross", "fast_period", 15)
    assert loader.registry["ema_cross"].params.fast_period == 15


# ---------------------------------------------------------------------------
# Unit: list_strategies
# ---------------------------------------------------------------------------

def test_list_strategies_returns_list():
    loader = PluginLoader()
    loader.discover()
    strategies = loader.list_strategies()
    assert isinstance(strategies, list)
    if strategies:
        s = strategies[0]
        assert "id" in s
        assert "parameters" in s
        assert "current_params" in s
