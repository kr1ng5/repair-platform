# 水电维修平台 - 开发服务器启动脚本

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  水电维修平台 - 开发服务器启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
try {
    $nodeVersion = node -v
    Write-Host "[信息] Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[错误] 未检测到 Node.js，请先安装" -ForegroundColor Red
    exit 1
}

# 检查依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "[信息] 正在安装依赖..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "[信息] 正在启动开发服务器..." -ForegroundColor Green
Write-Host ""
Write-Host "  用户端首页:     http://localhost:5173/home" -ForegroundColor White
Write-Host "  用户登录:       http://localhost:5173/login" -ForegroundColor White
Write-Host "  管理端登录:     http://localhost:5173/admin/login" -ForegroundColor White
Write-Host ""
Write-Host "  测试账号:" -ForegroundColor Yellow
Write-Host "  - 用户: 13800138000 / 123456"
Write-Host "  - 管理员: admin / admin123"
Write-Host "  - 维修工: worker1 / 123456"
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  按 Ctrl+C 停止服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
