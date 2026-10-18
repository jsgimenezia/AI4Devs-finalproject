#!/usr/bin/env bash
# Registra cada prompt tal cual en .claude/prompt-log.md (archivo local, no versionado).
#
# IMPORTANTE: en el evento UserPromptSubmit, lo que se escriba por la salida estándar
# llega al modelo como contexto. Este script no imprime nada por stdout y termina
# siempre con código 0, para no bloquear nunca un prompt.

set -u

entrada="$(cat)"
raiz="${CLAUDE_PROJECT_DIR:-$(pwd)}"
registro="$raiz/.claude/prompt-log.md"

command -v jq >/dev/null 2>&1 || exit 0

prompt="$(printf '%s' "$entrada" | jq -r '.prompt // empty' 2>/dev/null)" || exit 0
[ -n "$prompt" ] || exit 0

sesion="$(printf '%s' "$entrada" | jq -r '.session_id // "?"' 2>/dev/null)" || sesion="?"

mkdir -p "$(dirname "$registro")" 2>/dev/null || exit 0

{
  printf '\n---\n'
  printf '## %s · sesión %s\n\n' "$(date '+%Y-%m-%d %H:%M:%S')" "${sesion:0:8}"
  printf '%s\n' "$prompt"
} >> "$registro" 2>/dev/null

exit 0
