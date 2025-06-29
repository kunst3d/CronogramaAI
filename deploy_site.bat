@echo off
setlocal enabledelayedexpansion
title 🚀 Deploy GitHub Pages - Cronograma IA
color 0A

echo.
echo ========================================
echo    🚀 DEPLOY AUTOMATICO - GITHUB PAGES
echo ========================================
echo.

:: Verificar se está na pasta correta
if not exist "index.html" (
    echo ❌ ERRO: Arquivo index.html nao encontrado!
    echo 📂 Execute este script na pasta do repositorio GitHub Pages
    echo.
    pause
    exit /b 1
)

:: Verificar se é um repositório Git
if not exist ".git" (
    echo ❌ ERRO: Esta pasta nao e um repositorio Git!
    echo 📖 Siga o guia setup_github_pages.md primeiro
    echo.
    pause
    exit /b 1
)

echo ✅ Pasta correta detectada!
echo 📂 Diretorio: %CD%
echo.

:: Verificar status do Git
echo ➤ Verificando alteracoes...
git status --porcelain > temp_status.txt
set /a file_count=0
for /f %%i in (temp_status.txt) do set /a file_count+=1
del temp_status.txt

if %file_count% EQL 0 (
    echo ℹ️  Nenhuma alteracao detectada
    echo 🔄 Verificando se ha commits pendentes...
    
    git status | findstr "ahead" > nul
    if !errorlevel! EQL 0 (
        echo ➤ Enviando commits pendentes...
        git push origin main
        echo ✅ Push concluido!
    ) else (
        echo ✅ Tudo em dia! Site ja esta atualizado.
    )
    echo.
    goto :end
)

echo ✅ %file_count% arquivo(s) alterado(s) detectado(s)
echo.

:: Mostrar arquivos alterados
echo 📋 Arquivos que serao atualizados:
git status --porcelain
echo.

:: Solicitar mensagem de commit
set /p commit_msg="💬 Mensagem do commit (Enter = 'Atualizar site %date% %time%'): "
if "%commit_msg%"=="" set commit_msg=Atualizar site %date% %time%

echo.
echo ➤ Adicionando arquivos ao commit...
git add .

if !errorlevel! NEQ 0 (
    echo ❌ ERRO: Falha ao adicionar arquivos
    pause
    exit /b 1
)

echo ➤ Fazendo commit: "%commit_msg%"
git commit -m "%commit_msg%"

if !errorlevel! NEQ 0 (
    echo ❌ ERRO: Falha no commit
    pause
    exit /b 1
)

echo ➤ Enviando para GitHub...
git push origin main

if !errorlevel! NEQ 0 (
    echo ❌ ERRO: Falha no push para GitHub
    echo 🔧 Verifique sua conexao e credenciais
    pause
    exit /b 1
)

echo.
echo ====================================
echo           ✅ DEPLOY CONCLUIDO!
echo ====================================
echo.
echo 🌐 Seu site sera atualizado em 1-3 minutos
echo 📱 URL: https://USERNAME.github.io
echo 🔍 Status: Vá para github.com → seu-repo → Actions
echo.

:end
echo 💡 Dicas:
echo    • Use VisBug para editar visualmente
echo    • Ctrl+F5 para forcar atualizacao do navegador  
echo    • Actions tab mostra status do deploy
echo.
pause 