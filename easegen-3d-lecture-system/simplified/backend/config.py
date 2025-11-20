"""
配置文件
从环境变量读取配置
"""

import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()


class Config:
    """应用配置"""

    # Flask 配置
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    PORT = int(os.getenv('PORT', 7000))

    # EaseGen API 配置
    EASEGEN_API_URL = os.getenv(
        'EASEGEN_API_URL',
        'http://127.0.0.1:48080/admin-api'
    )

    EASEGEN_API_KEY = os.getenv(
        'EASEGEN_API_KEY',
        'ak_6Lhr10waeBfdRgmABBge'
    )

    # Xmov SDK 配置（必须在 .env 文件中配置）
    XMOV_APP_ID = os.getenv('XMOV_APP_ID')
    XMOV_APP_SECRET = os.getenv('XMOV_APP_SECRET')

    # 日志配置
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')


class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True


class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False


# 根据环境变量选择配置
env = os.getenv('FLASK_ENV', 'development')

if env == 'production':
    Config = ProductionConfig
else:
    Config = DevelopmentConfig
