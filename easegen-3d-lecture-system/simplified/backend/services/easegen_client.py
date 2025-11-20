"""
EaseGen API 客户端
负责与 EaseGen 后端 API 通信
"""

import requests
from typing import Dict, List, Optional


class EaseGenClient:
    """EaseGen API 客户端"""

    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'easegen-api-key': api_key,
            'Content-Type': 'application/json'
        })

    def _request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """
        发送 HTTP 请求
        """
        url = f'{self.base_url}{endpoint}'

        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            print(f'[EaseGen API] 请求失败: {str(e)}')
            raise

    def test_connection(self) -> bool:
        """测试连接"""
        try:
            # 尝试获取课程列表
            self.get_courses(page=1, size=1)
            return True
        except:
            return False

    def get_courses(self, page: int = 1, size: int = 20) -> Dict:
        """
        获取课程列表
        """
        return self._request('GET', '/digitalcourse/courses/getCoursePage', params={
            'pageNo': page,
            'pageSize': size
        })

    def get_course_detail(self, course_id: str) -> Dict:
        """
        获取课程详情
        """
        return self._request('GET', f'/digitalcourse/courses/get', params={
            'id': course_id
        })

    def get_course_text(self, course_id: str, no: int) -> Dict:
        """
        获取课程文本（单个片段）
        """
        return self._request('GET', '/digitalcourse/courses/getCourseText', params={
            'course_id': course_id,
            'no': no
        })

    def get_course_ppt_url(self, course_id: str, no: int) -> str:
        """
        获取课程 PPT 图片 URL
        """
        # 根据 EaseGen API 规则构造 URL
        # 格式: /admin-api/infra/file/{courseId}/get/slide_{no}.png
        return f'{self.base_url}/infra/file/{course_id}/get/slide_{no}.png'
