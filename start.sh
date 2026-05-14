#!/bin/bash

# 水电维修平台 - 开发服务器启动脚本

echo "========================================"
echo "  水电维修平台 - 开发服务器启动脚本"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[错误] 未检测到 Node.js，请先安装${NC}"
    exit 1
fi

echo -e "${GREEN}[信息] Node.js 版本: $(node -v)${NC}"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[信息] 正在安装依赖...${NC}"
    npm install
fi

echo ""
echo -e "${GREEN}[信息] 正在启动开发服务器...${NC}"
echo ""
echo "  用户端首页:     http://localhost:5173/home"
echo "  用户登录:       http://localhost:5173/login"
echo "  管理端登录:     http://localhost:5173/admin/login"
echo ""
echo -e "${YELLOW}  测试账号:${NC}"
echo "  - 用户: 13800138000 / 123456"
echo "  - 管理员: admin / admin123"
echo "  - 维修工: worker1 / 123456"
echo ""
echo "========================================"
echo "  按 Ctrl+C 停止服务器"
echo "========================================"
echo ""

npm run dev
