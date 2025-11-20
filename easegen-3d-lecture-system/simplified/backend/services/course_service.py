"""
课程服务
整合业务逻辑，处理课程相关操作
"""

from typing import Dict, List
from .easegen_client import EaseGenClient


class CourseService:
    """课程服务"""

    def __init__(self, easegen_client: EaseGenClient):
        self.client = easegen_client

    def get_courses(self, page: int = 1, size: int = 20) -> Dict:
        """
        获取课程列表
        """
        try:
            response = self.client.get_courses(page, size)

            if response.get('code') != 0:
                raise Exception(response.get('msg', '获取课程列表失败'))

            # 格式化返回数据
            data = response.get('data', {})
            courses = data.get('list', [])

            # 格式化课程数据
            formatted_courses = []
            for course in courses:
                formatted_courses.append({
                    'id': str(course.get('id', '')),
                    'name': course.get('name', '未命名课程'),
                    'description': course.get('description', ''),
                    'totalSegments': course.get('totalNum', 0),
                    'duration': course.get('duration', 0),
                    'thumbnail': course.get('thumbnail', ''),
                    'progress': course.get('progress', 0)  # 如果 API 有返回
                })

            return {
                'total': data.get('total', 0),
                'list': formatted_courses
            }

        except Exception as e:
            print(f'[CourseService] 获取课程列表失败: {str(e)}')
            raise

    def get_course_detail(self, course_id: str) -> Dict:
        """
        获取课程详情
        """
        try:
            response = self.client.get_course_detail(course_id)

            if response.get('code') != 0:
                raise Exception(response.get('msg', '获取课程详情失败'))

            course = response.get('data', {})

            return {
                'id': str(course.get('id', '')),
                'name': course.get('name', ''),
                'description': course.get('description', ''),
                'totalSegments': course.get('totalNum', 0),
                'duration': course.get('duration', 0),
                'thumbnail': course.get('thumbnail', '')
            }

        except Exception as e:
            print(f'[CourseService] 获取课程详情失败: {str(e)}')
            raise

    def get_all_segments(self, course_id: str) -> Dict:
        """
        获取课程的所有片段（包括文本和 PPT URL）
        """
        try:
            # 1. 先获取第一个片段，从中获取总片段数
            first_response = self.client.get_course_text(course_id, 1)

            if first_response.get('code') != 0:
                raise Exception(first_response.get('msg', '获取第一个片段失败'))

            first_data = first_response.get('data', {})
            total_segments = first_data.get('totalNo', 0)
            course_name = f'课程 {course_id}'  # 使用默认名称，因为无法获取详情

            print(f'[CourseService] 开始获取课程 {course_id} 的 {total_segments} 个片段')

            # 2. 循环获取所有片段的文本
            segments = []

            # 第一个片段已经获取过了，使用 API 返回的真实图片 URL
            segments.append({
                'no': 1,
                'text': first_data.get('text', ''),
                'pptImageUrl': first_data.get('img', '')
            })

            # 获取剩余片段
            for no in range(2, total_segments + 1):
                try:
                    # 获取文本和图片
                    text_response = self.client.get_course_text(course_id, no)

                    if text_response.get('code') == 0:
                        data = text_response.get('data', {})
                        text = data.get('text', '')
                        # 使用 API 返回的真实图片 URL
                        ppt_url = data.get('img', '')
                    else:
                        print(f'[Warning] 获取片段 {no} 文本失败，使用空文本')
                        text = ''
                        ppt_url = ''

                    segments.append({
                        'no': no,
                        'text': text,
                        'pptImageUrl': ppt_url
                    })

                except Exception as e:
                    print(f'[Warning] 获取片段 {no} 失败: {str(e)}，跳过')
                    continue

            print(f'[CourseService] ✅ 成功获取 {len(segments)}/{total_segments} 个片段')

            return {
                'courseId': course_id,
                'courseName': course_name,
                'totalSegments': total_segments,
                'segments': segments
            }

        except Exception as e:
            print(f'[CourseService] 获取课程片段失败: {str(e)}')
            raise


    def get_segment(self, course_id: str, no: int) -> Dict:
        """
        获取单个片段
        """
        try:
            # 获取文本和图片
            text_response = self.client.get_course_text(course_id, no)

            if text_response.get('code') != 0:
                raise Exception(text_response.get('msg', '获取片段失败'))

            data = text_response.get('data', {})
            text = data.get('text', '')
            # 使用 API 返回的真实图片 URL
            ppt_url = data.get('img', '')

            return {
                'no': no,
                'text': text,
                'pptImageUrl': ppt_url
            }

        except Exception as e:
            print(f'[CourseService] 获取片段失败: {str(e)}')
            raise
