/**
 * UI 控制器
 * 负责所有 UI 交互和更新
 */

class UIController {
    constructor(player) {
        this.player = player;
        this.initElements();
        this.initEventListeners();
        this.initTheme();
    }

    /**
     * 初始化 DOM 元素引用
     */
    initElements() {
        // Top Bar (新增)
        this.courseBreadcrumb = document.getElementById('courseBreadcrumb');
        this.systemStatus = document.getElementById('systemStatus');

        // 课程列表
        this.courseList = document.getElementById('courseList');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.skeletonLoader = document.getElementById('skeletonLoader');

        // PPT 区域
        this.pptContainer = document.getElementById('pptContainer');
        this.emptyState = document.getElementById('emptyState');
        this.pptDisplay = document.getElementById('pptDisplay');
        this.pptImage = document.getElementById('pptImage');
        this.segmentText = document.getElementById('segmentText');

        // 控制栏
        this.previousBtn = document.getElementById('previousBtn');
        this.playBtn = document.getElementById('playBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressFill = document.getElementById('progressFill');
        this.currentTime = document.getElementById('currentTime');
        this.totalTime = document.getElementById('totalTime');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');

        // 数字人
        this.avatarStatusDot = document.getElementById('avatarStatusDot');
        this.avatarStatusLabel = document.getElementById('avatarStatusLabel');
        this.avatarLoading = document.getElementById('avatarLoading');
        this.waveformContainer = document.getElementById('waveformContainer');

        // Toast
        this.toastContainer = document.getElementById('toastContainer');
    }

    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 刷新课程列表
        this.refreshBtn?.addEventListener('click', () => this.loadCourses());

        // 播放控制
        this.playBtn?.addEventListener('click', () => this.handlePlay());
        this.previousBtn?.addEventListener('click', () => this.handlePrevious());
        this.nextBtn?.addEventListener('click', () => this.handleNext());

        // 进度条点击跳转
        const progressBarTrack = document.querySelector('.progress-bar-track');
        if (progressBarTrack) {
            progressBarTrack.addEventListener('click', (e) => this.handleProgressBarClick(e));
            progressBarTrack.style.cursor = 'pointer';
        }

        // 音量和全屏控制
        this.volumeBtn?.addEventListener('click', () => {
            Logger.debug('音量控制点击');
            // 可以添加音量控制弹窗
        });

        this.fullscreenBtn?.addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    /**
     * 切换全屏
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.pptContainer?.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }

    /**
     * 初始化主题
     */
    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && CONFIG.UI.DEFAULT_THEME === 'dark') ||
            (!savedTheme && CONFIG.UI.DEFAULT_THEME === 'auto' && prefersDark)) {
            document.body.classList.add('dark-mode');
        }
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.showToast(isDark ? '已切换到深色模式' : '已切换到浅色模式', 'info');
    }

    /**
     * 加载课程列表
     */
    async loadCourses() {
        try {
            this.showSkeleton();

            const response = await api.get(CONFIG.API.ENDPOINTS.COURSES, {
                page: 1,
                size: CONFIG.UI.COURSES_PER_PAGE
            });

            if (response.code === 0 && response.data) {
                const courses = response.data.list || [];
                this.renderCourses(courses);
            } else {
                throw new Error(response.message || '加载失败');
            }

        } catch (error) {
            Logger.error('加载课程列表失败:', error);
            this.showToast('加载课程列表失败', 'error');
            this.courseList.innerHTML = '<div class="empty-state"><p class="empty-description">加载失败，请重试</p></div>';
        }
    }

    /**
     * 显示骨架屏
     */
    showSkeleton() {
        if (this.skeletonLoader) {
            this.skeletonLoader.style.display = 'flex';
        }
    }

    /**
     * 隐藏骨架屏
     */
    hideSkeleton() {
        if (this.skeletonLoader) {
            this.skeletonLoader.style.display = 'none';
        }
    }

    /**
     * 渲染课程列表
     */
    renderCourses(courses) {
        this.hideSkeleton();

        if (courses.length === 0) {
            this.courseList.innerHTML = '<div class="empty-state"><p class="empty-description">暂无课程</p></div>';
            return;
        }

        this.courseList.innerHTML = courses.map(course => this.createCourseCardHTML(course)).join('');

        // 绑定点击事件
        this.courseList.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', () => {
                const courseId = card.dataset.courseId;
                this.selectCourse(courseId, card);
            });
        });
    }

    /**
     * 创建课程卡片 HTML
     */
    createCourseCardHTML(course) {
        const hasThumbnail = course.thumbnail && course.thumbnail.trim() !== '';

        return `
            <div class="course-card" data-course-id="${course.id}" data-selected="false">
                <div class="course-card__thumbnail">
                    ${hasThumbnail ? `<img src="${course.thumbnail}" alt="${course.name}" class="course-card__image"/>` : ''}
                    <div class="course-card__thumbnail-fallback">
                        <svg class="course-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>

                <div class="course-card__content">
                    <h3 class="course-card__title">${course.name || '未命名课程'}</h3>
                    <p class="course-card__id">ID: <span class="course-card__id-value">${course.id}</span></p>

                    <div class="course-card__meta">
                        <span class="course-card__badge">
                            <svg class="course-card__badge-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                            </svg>
                            <span class="course-card__badge-text">${course.totalSegments || 0} 段</span>
                        </span>
                    </div>
                </div>

                <div class="course-card__indicator"></div>
            </div>
        `;
    }

    /**
     * 格式化时长（毫秒 → MM:SS）
     */
    formatDuration(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * 选择课程
     */
    async selectCourse(courseId, cardElement) {
        try {
            // 更新选中状态
            this.courseList.querySelectorAll('.course-card').forEach(c => {
                c.classList.remove('active');
                c.setAttribute('data-selected', 'false');
            });
            cardElement.classList.add('active');
            cardElement.setAttribute('data-selected', 'true');

            // 加载课程
            await this.player.loadCourse(courseId);

            this.showToast('课程加载成功', 'success');

        } catch (error) {
            Logger.error('选择课程失败:', error);
            this.showToast('课程加载失败', 'error');
        }
    }

    /**
     * 更新课程信息显示
     */
    updateCourseInfo(course) {
        // 更新 breadcrumb
        if (this.courseBreadcrumb) {
            this.courseBreadcrumb.innerHTML = `${course.name}`;
        }

        // 更新系统状态
        if (this.systemStatus) {
            this.systemStatus.textContent = '已加载';
        }
    }

    /**
     * 更新片段显示
     */
    updateSegmentDisplay(segment, index, total) {
        // 隐藏空状态，显示 PPT
        if (this.emptyState) this.emptyState.style.display = 'none';
        if (this.pptDisplay) this.pptDisplay.style.display = 'block';

        // 更新 PPT 图片
        if (this.pptImage && segment.pptImageUrl) {
            this.pptImage.src = segment.pptImageUrl;
        }

        // 更新字幕文本（仅显示文本，不显示片段编号）
        if (this.segmentText) {
            this.segmentText.textContent = segment.text || '';
        }

        // 更新 breadcrumb
        if (this.courseBreadcrumb) {
            const courseName = this.player?.currentCourse?.name || '当前课程';
            this.courseBreadcrumb.innerHTML = `${courseName} <span>/ 第 ${segment.no} 节</span>`;
        }

        // 更新进度条
        const progress = ((index + 1) / total) * 100;
        this.updateProgress(progress);

        // 更新进度显示为片段格式
        this.updateProgressDisplay(index + 1, total);
    }

    /**
     * 更新进度条
     */
    updateProgress(percentage) {
        if (this.progressFill) {
            this.progressFill.style.width = `${percentage}%`;
        }
    }

    /**
     * 更新进度显示（片段格式）
     */
    updateProgressDisplay(current, total) {
        if (this.currentTime) {
            this.currentTime.textContent = String(current).padStart(2, '0');
        }
        if (this.totalTime) {
            this.totalTime.textContent = String(total).padStart(2, '0');
        }
    }

    /**
     * 更新播放按钮状态
     */
    updatePlayButton(isPlaying) {
        if (this.playBtn) {
            if (isPlaying) {
                this.playBtn.classList.add('playing');
            } else {
                this.playBtn.classList.remove('playing');
            }
        }
    }

    /**
     * 更新数字人状态
     */
    updateAvatarStatus(state, label) {
        if (this.avatarStatusDot) {
            this.avatarStatusDot.className = 'status-dot';

            if (state === 'speaking') {
                this.avatarStatusDot.classList.add('active');
                // 显示波形
                if (this.waveformContainer) {
                    this.waveformContainer.style.display = 'flex';
                }
            } else {
                if (this.waveformContainer) {
                    this.waveformContainer.style.display = 'none';
                }
            }
        }

        if (this.avatarStatusLabel) {
            this.avatarStatusLabel.textContent = label || '就绪';
        }

        // 隐藏加载状态
        if (this.avatarLoading && state !== 'loading') {
            this.avatarLoading.style.display = 'none';
        }
    }

    /**
     * 播放按钮处理（切换播放/暂停）
     */
    async handlePlay() {
        try {
            // 如果正在播放，则暂停；否则播放
            if (this.player.isPlaying && !this.player.isPaused) {
                this.player.pause();
            } else {
                await this.player.play();
            }
        } catch (error) {
            this.showToast('播放失败: ' + error.message, 'error');
        }
    }

    /**
     * 停止按钮处理
     */
    handleStop() {
        this.player.stop();
    }

    /**
     * 上一段按钮处理
     */
    async handlePrevious() {
        await this.player.previous();
    }

    /**
     * 下一段按钮处理
     */
    async handleNext() {
        await this.player.next();
    }

    /**
     * 进度条点击处理
     */
    handleProgressBarClick(event) {
        if (!this.player.currentCourse || !this.player.segments.length) {
            return;
        }

        const progressBarTrack = event.currentTarget;
        const rect = progressBarTrack.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const barWidth = rect.width;
        const percentage = clickX / barWidth;

        // 计算目标片段索引
        const totalSegments = this.player.segments.length;
        const targetIndex = Math.floor(percentage * totalSegments);
        const clampedIndex = Math.max(0, Math.min(targetIndex, totalSegments - 1));

        Logger.info(`点击进度条跳转到片段: ${clampedIndex + 1}/${totalSegments}`);

        // 跳转到指定片段
        this.player.seekTo(clampedIndex);
    }

    /**
     * 显示 Toast 通知
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    ${this.getToastIcon(type)}
                </div>
                <p class="toast-message">${message}</p>
            </div>
        `;

        this.toastContainer?.appendChild(toast);

        // 自动移除
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.UI.TOAST_DURATION);
    }

    /**
     * 获取 Toast 图标
     */
    getToastIcon(type) {
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 0a10 10 0 1010 10A10 10 0 0010 0zm5 8l-6 6-3-3 1.5-1.5L9 11l4.5-4.5z"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 0a10 10 0 1010 10A10 10 0 0010 0zm1 15H9v-2h2zm0-4H9V5h2z"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 0L0 18h20L10 0zm1 15H9v-2h2zm0-4H9V6h2z"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="10"/><path d="M9 5h2v2H9zm0 4h2v6H9z" fill="white"/></svg>'
        };

        return icons[type] || icons.info;
    }

    // initPillSelectors, updateSystemStatus, updateDisplayMode 方法已移除
    // 原因：Xmov SDK 不支持显示模式切换，状态应由系统自动管理
}

// 导出到全局
window.UIController = UIController;
