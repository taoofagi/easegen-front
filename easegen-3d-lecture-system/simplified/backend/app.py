"""
简化版 3D 数字人课程播放系统 - 后端服务
Flask 应用主文件
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from services.easegen_client import EaseGenClient
from services.course_service import CourseService

# 创建 Flask 应用
app = Flask(__name__)
app.config.from_object(Config)

# 启用 CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# 创建服务实例
easegen_client = EaseGenClient(
    base_url=Config.EASEGEN_API_URL,
    api_key=Config.EASEGEN_API_KEY
)

course_service = CourseService(easegen_client)


# ========== API 路由 ==========

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'code': 0,
        'message': 'success',
        'data': {
            'status': 'healthy',
            'version': '1.0.0',
            'easegen_connected': easegen_client.test_connection()
        }
    })


@app.route('/api/courses', methods=['GET'])
def get_courses():
    """
    获取课程列表
    Query 参数:
        - page: 页码（默认 1）
        - size: 每页数量（默认 20）
    """
    try:
        page = int(request.args.get('page', 1))
        size = int(request.args.get('size', 20))

        result = course_service.get_courses(page, size)

        return jsonify({
            'code': 0,
            'message': 'success',
            'data': result
        })

    except Exception as e:
        app.logger.error(f'获取课程列表失败: {str(e)}')
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


@app.route('/api/course/<course_id>', methods=['GET'])
def get_course_detail(course_id):
    """
    获取课程详情
    """
    try:
        course = course_service.get_course_detail(course_id)

        if not course:
            return jsonify({
                'code': 404,
                'message': '课程不存在',
                'data': None
            }), 404

        return jsonify({
            'code': 0,
            'message': 'success',
            'data': course
        })

    except Exception as e:
        app.logger.error(f'获取课程详情失败: {str(e)}')
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


@app.route('/api/segments/<course_id>', methods=['GET'])
def get_course_segments(course_id):
    """
    获取课程的所有片段（包括文本和 PPT URL）
    """
    try:
        segments_data = course_service.get_all_segments(course_id)

        return jsonify({
            'code': 0,
            'message': 'success',
            'data': segments_data
        })

    except Exception as e:
        app.logger.error(f'获取课程片段失败: {str(e)}')
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


@app.route('/api/xmov-config', methods=['GET'])
def get_xmov_config():
    """
    获取 Xmov SDK 配置
    """
    try:
        app_id = Config.XMOV_APP_ID
        app_secret = Config.XMOV_APP_SECRET

        if not app_id or not app_secret:
            return jsonify({
                'code': 500,
                'message': '服务器未配置 Xmov 凭证',
                'data': None
            }), 500

        return jsonify({
            'code': 0,
            'message': 'success',
            'data': {
                'appId': app_id,
                'appSecret': app_secret
            }
        })

    except Exception as e:
        app.logger.error(f'获取 Xmov 配置失败: {str(e)}')
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


# ========== 错误处理 ==========

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'code': 404,
        'message': 'Not Found',
        'data': None
    }), 404


@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f'服务器错误: {str(error)}')
    return jsonify({
        'code': 500,
        'message': 'Internal Server Error',
        'data': None
    }), 500


# ========== 启动服务 ==========

if __name__ == '__main__':
    print('=' * 60)
    print('  简化版 3D 数字人课程播放系统 - 后端服务')
    print('=' * 60)
    print(f'  服务地址: http://127.0.0.1:{Config.PORT}')
    print(f'  EaseGen API: {Config.EASEGEN_API_URL}')
    print(f'  调试模式: {Config.DEBUG}')
    print('=' * 60)
    print()

    app.run(
        host='0.0.0.0',
        port=Config.PORT,
        debug=Config.DEBUG
    )
