"""
Plugin Loader — discovers, imports, and manages strategy plugins.

Directory layout expected:
    engine/strategies/
        <strategy_id>/
            config.yaml
            strategy.py      ← must define class <CamelCase>Strategy(BaseStrategy)

On startup: scans strategies/ and registers all valid plugins.
Hot-reload (Sprint 3): watchdog fires _reload_strategy() on file changes.
"""

import importlib.util
import logging
import re
import sys
from pathlib import Path
from typing import Optional

import yaml

from engine.core._base import BaseStrategy

logger = logging.getLogger(__name__)

STRATEGIES_DIR = Path(__file__).parent.parent / "strategies"


def _to_class_name(folder_name: str) -> str:
    """'ema_cross' → 'EmaCrossStrategy'"""
    return "".join(word.capitalize() for word in folder_name.split("_")) + "Strategy"


def _load_config(strategy_dir: Path) -> Optional[dict]:
    config_path = strategy_dir / "config.yaml"
    if not config_path.exists():
        return None
    with config_path.open() as f:
        return yaml.safe_load(f)


def _import_strategy_class(strategy_dir: Path, class_name: str) -> Optional[type]:
    module_path = strategy_dir / "strategy.py"
    if not module_path.exists():
        return None

    module_name = f"strategies.{strategy_dir.name}.strategy"
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    if spec is None or spec.loader is None:
        return None

    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    try:
        spec.loader.exec_module(module)  # type: ignore[union-attr]
    except Exception as exc:
        logger.error("Failed to import %s: %s", module_path, exc)
        return None

    cls = getattr(module, class_name, None)
    if cls is None:
        logger.error("Class '%s' not found in %s", class_name, module_path)
    return cls


class PluginLoader:
    """
    Maintains the live registry of strategy instances.

    Usage:
        loader = PluginLoader()
        loader.discover()
        instance = loader.registry["ema_cross"]
    """

    def __init__(self) -> None:
        self.registry: dict[str, BaseStrategy] = {}
        self.configs: dict[str, dict] = {}

    def discover(self) -> None:
        """Scan STRATEGIES_DIR and load all valid plugins."""
        if not STRATEGIES_DIR.exists():
            logger.warning("Strategies directory not found: %s", STRATEGIES_DIR)
            return

        for strategy_dir in sorted(STRATEGIES_DIR.iterdir()):
            if not strategy_dir.is_dir() or strategy_dir.name.startswith("_"):
                continue
            self._load_plugin(strategy_dir)

        logger.info("Loaded %d strategy plugin(s): %s", len(self.registry), list(self.registry))

    def _load_plugin(self, strategy_dir: Path) -> bool:
        folder = strategy_dir.name
        config = _load_config(strategy_dir)
        if config is None:
            logger.debug("Skipping %s: no config.yaml", folder)
            return False

        class_name = _to_class_name(folder)
        cls = _import_strategy_class(strategy_dir, class_name)
        if cls is None:
            return False

        if not issubclass(cls, BaseStrategy):
            logger.error("%s does not extend BaseStrategy", class_name)
            return False

        instance: BaseStrategy = cls()
        instance._init_from_config(config)

        self.registry[config["id"]] = instance
        self.configs[config["id"]] = config
        logger.info("Registered strategy '%s' (%s)", config["id"], config.get("name", ""))
        return True

    def reload_plugin(self, strategy_id: str) -> bool:
        """
        Re-load a single strategy from disk.
        Called by the watchdog in Sprint 3.
        Preserves the existing instance slot so the engine keeps a stable reference.
        """
        strategy_dir = STRATEGIES_DIR / strategy_id
        if not strategy_dir.exists():
            logger.warning("Cannot reload '%s': directory not found", strategy_id)
            return False

        config = _load_config(strategy_dir)
        if config is None:
            return False

        class_name = _to_class_name(strategy_id)
        # Remove stale module so importlib re-executes fresh code
        stale_key = f"strategies.{strategy_id}.strategy"
        sys.modules.pop(stale_key, None)

        cls = _import_strategy_class(strategy_dir, class_name)
        if cls is None:
            return False

        existing = self.registry.get(strategy_id)
        if existing is not None:
            try:
                existing.on_stop()
            except Exception as exc:
                logger.warning("on_stop() raised for %s: %s", strategy_id, exc)

        instance: BaseStrategy = cls()
        instance._init_from_config(config)
        self.registry[strategy_id] = instance
        self.configs[strategy_id] = config
        logger.info("Hot-reloaded strategy '%s'", strategy_id)
        return True

    def update_param(self, strategy_id: str, key: str, value) -> bool:
        """Update a single parameter on a live strategy instance."""
        instance = self.registry.get(strategy_id)
        if instance is None:
            return False
        instance._update_param(key, value)
        # Persist to YAML
        config = self.configs.get(strategy_id, {})
        if "parameters" in config and key in config["parameters"]:
            config["parameters"][key]["default"] = value
            config_path = STRATEGIES_DIR / strategy_id / "config.yaml"
            with config_path.open("w") as f:
                yaml.dump(config, f, default_flow_style=False)
        return True

    def get_schema(self, strategy_id: str) -> Optional[dict]:
        """Return the full config dict (including parameter schema) for a strategy."""
        return self.configs.get(strategy_id)

    def list_strategies(self) -> list[dict]:
        """Summarise all registered strategies for the API."""
        out = []
        for sid, instance in self.registry.items():
            cfg = self.configs.get(sid, {})
            out.append({
                "id": sid,
                "name": cfg.get("name", sid),
                "description": cfg.get("description", ""),
                "enabled": cfg.get("enabled", False),
                "symbol": instance.symbol,
                "parameters": cfg.get("parameters", {}),
                "risk_limits": cfg.get("risk_limits", {}),
                "current_params": instance.params.as_dict(),
            })
        return out
