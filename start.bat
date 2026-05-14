@echo off
chcp 65001 >nul
title 水电维修平台 - 开发服务器

echo ========================================
echo   水电维修平台 - 开发服务器启动脚本
echo ========================================
echo.

:: 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

:: 显示 Node.js 版本
echo [信息] Node.js 版本：
node -v
echo.

:: 检查 node_modules 是否存在
if not exist "node_modules" (
    echo [信息] 正在安装依赖...
    call npm install
    echo.
)

:: 启动开发服务器
echo [信息] 正在启动开发服务器...
echo.
echo   用户端首页:     http://localhost:5173/home
echo   用户登录:       http://localhost:5173/login
echo   管理端登录:     http://localhost:5173/admin/login
echo.
echo   测试账号:
echo   - 用户: 13800138000 / 123456
echo   - 管理员: admin / admin123
echo   - 维修工: worker1 / 123456
echo.
echo ========================================
echo   按 Ctrl+C 停止服务器
echo ========================================
echo.

call npm run dev
pause
