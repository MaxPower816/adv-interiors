#!/bin/zsh
cd "$(dirname "$0")"

export PATH="/Users/kirillemanov/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
export WATCHPACK_POLLING=true
export WATCHPACK_POLLING_INTERVAL=800

node_modules/.bin/next dev --webpack -H 127.0.0.1 -p 3011
