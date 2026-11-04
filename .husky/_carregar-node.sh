# Editores como o VS Code rodam os hooks sem o shell interativo: o nvm não está carregado e o
# pnpm (ativado pelo corepack no Node do .nvmrc) não aparece. Aqui ele é carregado só nesse caso.
if ! command -v pnpm >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    nvm use --silent >/dev/null 2>&1
  fi
fi
