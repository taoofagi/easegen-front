@echo off
echo ===============================================
echo   3D 数字人课程播放系统 - 启动脚本
echo ===============================================
echo.

:: 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

:: 进入后端目录
cd backend

:: 检查虚拟环境
if not exist ".venv" (
    echo [信息] 创建虚拟环境...
    python -m venv .venv
)

:: 激活虚拟环境
echo [信息] 激活虚拟环境...
call .venv\Scripts\activate.bat

:: 安装依赖
echo [信息] 安装依赖...
pip install -r requirements.txt

:: 检查 .env 文件
if not exist ".env" (
    echo [信息] 复制环境变量配置文件...
    copy .env.example .env
    echo [提示] 请编辑 backend\.env 文件配置您的环境变量
    echo.
    pause
)

:: 启动服务
echo.
echo ===============================================
echo   启动后端服务...
echo ===============================================
echo.
python app.py

pause
