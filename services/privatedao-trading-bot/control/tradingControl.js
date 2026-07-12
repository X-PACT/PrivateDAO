const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTROL_PATH = path.join(ROOT, 'data', 'trading-control.json');

function defaultState() {
  return {
    paused: false,
    reason: null,
    updated_at: null,
    updated_by: null,
  };
}

function readTradingControl() {
  try {
    if (!fs.existsSync(CONTROL_PATH)) return defaultState();
    const raw = fs.readFileSync(CONTROL_PATH, 'utf8').trim();
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      paused: Boolean(parsed.paused),
    };
  } catch {
    return defaultState();
  }
}

function writeTradingControl(state) {
  const next = {
    ...defaultState(),
    ...state,
    paused: Boolean(state?.paused),
    updated_at: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(CONTROL_PATH), { recursive: true });
  fs.writeFileSync(CONTROL_PATH, JSON.stringify(next, null, 2));
  return next;
}

function setTradingPaused(paused, reason = null, updatedBy = null) {
  return writeTradingControl({
    ...readTradingControl(),
    paused,
    reason: reason || null,
    updated_by: updatedBy || null,
  });
}

function isTradingPaused() {
  return Boolean(readTradingControl().paused);
}

module.exports = {
  CONTROL_PATH,
  readTradingControl,
  writeTradingControl,
  setTradingPaused,
  isTradingPaused,
};
