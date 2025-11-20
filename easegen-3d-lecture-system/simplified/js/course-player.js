/**
 * 课程播放器核心逻辑
 * 负责课程加载、播放控制、进度管理
 */

class CoursePlayer {
    constructor(xmovManager) {
        this.xmovManager = xmovManager;

        // 播放状态
        this.currentCourse = null;
        this.segments = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;

        // 时间统计
        this.startTime = null;
        this.totalDuration = 0;
        this.currentDuration = 0;

        // 回调函数
        this.callbacks = {
            onCourseLoaded: null,
            onSegmentChange: null,
            onPlayStateChange: null,
            onProgress: null,
            onComplete: null,
            onError: null
        };
    }

    /**
     * 加载课程
     * @param {string} courseId - 课程 ID
     */
    async loadCourse(courseId) {
        try {
            Logger.info(`开始加载课程: ${courseId}`);

            // 1. 获取课程详情和所有片段
            const response = await api.get(`${CONFIG.API.ENDPOINTS.SEGMENTS}/${courseId}`);

            if (response.code !== 0 || !response.data) {
                throw new Error(response.message || '加载课程失败');
            }

            const { courseId: id, courseName, totalSegments, segments } = response.data;

            this.currentCourse = {
                id,
                name: courseName,
                totalSegments
            };

            this.segments = segments || [];
            this.currentIndex = 0;
            this.isPlaying = false;
            this.isPaused = false;

            Logger.info(`✅ 课程加载成功: ${courseName}`, {
                totalSegments,
                segmentsCount: this.segments.length
            });

            // 触发回调
            if (this.callbacks.onCourseLoaded) {
                this.callbacks.onCourseLoaded(this.currentCourse, this.segments);
            }

            return this.currentCourse;

        } catch (error) {
            Logger.error('加载课程失败:', error);

            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }

            throw error;
        }
    }

    /**
     * 开始播放
     */
    async play() {
        if (!this.currentCourse || this.segments.length === 0) {
            Logger.warn('没有加载课程');
            return;
        }

        if (!this.xmovManager.isReady) {
            Logger.warn('数字人 SDK 未就绪');
            throw new Error('数字人 SDK 未就绪');
        }

        // 如果是暂停状态，从当前片段重新开始播放（而不是继续）
        if (this.isPaused) {
            Logger.info('从当前片段重新开始播放');
            this.isPaused = false;
            this.isPlaying = true;
            this._notifyPlayStateChange('playing');
            // 从当前片段重新开始
            await this._playSegment(this.currentIndex);
            return;
        }

        Logger.info('开始播放课程');

        this.isPlaying = true;
        this.isPaused = false;
        this.startTime = Date.now();

        // 更新播放状态
        this._notifyPlayStateChange('playing');

        // 开始播放当前片段
        await this._playSegment(this.currentIndex);
    }

    /**
     * 播放指定片段
     * @param {number} index - 片段索引
     */
    async _playSegment(index) {
        if (index < 0 || index >= this.segments.length) {
            Logger.warn(`片段索引超出范围: ${index}`);
            this.complete();
            return;
        }

        if (!this.isPlaying || this.isPaused) {
            Logger.info('播放已停止或暂停');
            return;
        }

        const segment = this.segments[index];
        Logger.info(`播放片段 ${segment.no}/${this.currentCourse.totalSegments}`);

        // 1. 通知片段变化
        if (this.callbacks.onSegmentChange) {
            this.callbacks.onSegmentChange(segment, index);
        }

        // 2. 驱动数字人说话（等待播放完成）
        try {
            await this.xmovManager.speak(segment.text);

            // 3. 等待间隔时间
            if (CONFIG.PLAYER.SEGMENT_DELAY > 0) {
                await Utils.sleep(CONFIG.PLAYER.SEGMENT_DELAY);
            }

            // 4. 自动播放下一段
            if (this.isPlaying && !this.isPaused && CONFIG.PLAYER.AUTO_PLAY_NEXT) {
                this.currentIndex++;

                if (this.currentIndex < this.segments.length) {
                    await this._playSegment(this.currentIndex);
                } else {
                    this.complete();
                }
            }

        } catch (error) {
            Logger.error('播放片段失败:', error);

            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
        }
    }

    /**
     * 暂停播放
     */
    pause() {
        if (!this.isPlaying) return;

        Logger.info('暂停播放');

        this.isPaused = true;
        this._notifyPlayStateChange('paused');

        // 停止数字人当前播放
        this.xmovManager.stop();
    }

    /**
     * 继续播放
     */
    async resume() {
        if (!this.isPaused) return;

        Logger.info('继续播放');

        this.isPaused = false;
        this._notifyPlayStateChange('playing');

        // 继续播放当前片段
        await this._playSegment(this.currentIndex);
    }

    /**
     * 停止播放
     */
    stop() {
        Logger.info('停止播放');

        this.isPlaying = false;
        this.isPaused = false;
        this.currentIndex = 0;
        this.startTime = null;

        // 停止数字人
        this.xmovManager.stop();

        this._notifyPlayStateChange('stopped');
    }

    /**
     * 播放完成
     */
    complete() {
        Logger.info('✅ 课程播放完成');

        this.isPlaying = false;
        this.isPaused = false;
        this.currentIndex = 0;

        this._notifyPlayStateChange('completed');

        if (this.callbacks.onComplete) {
            this.callbacks.onComplete(this.currentCourse);
        }
    }

    /**
     * 跳转到上一段
     */
    async previous() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            Logger.info(`跳转到上一段: ${this.currentIndex + 1}`);

            if (this.isPlaying) {
                await this._playSegment(this.currentIndex);
            } else {
                // 不播放，只更新 UI
                if (this.callbacks.onSegmentChange) {
                    this.callbacks.onSegmentChange(this.segments[this.currentIndex], this.currentIndex);
                }
            }
        }
    }

    /**
     * 跳转到下一段
     */
    async next() {
        if (this.currentIndex < this.segments.length - 1) {
            this.currentIndex++;
            Logger.info(`跳转到下一段: ${this.currentIndex + 1}`);

            if (this.isPlaying) {
                await this._playSegment(this.currentIndex);
            } else {
                // 不播放，只更新 UI
                if (this.callbacks.onSegmentChange) {
                    this.callbacks.onSegmentChange(this.segments[this.currentIndex], this.currentIndex);
                }
            }
        }
    }

    /**
     * 跳转到指定片段
     * @param {number} index - 片段索引
     */
    async seekTo(index) {
        if (index >= 0 && index < this.segments.length) {
            this.currentIndex = index;
            Logger.info(`跳转到片段: ${index + 1}`);

            if (this.isPlaying) {
                await this._playSegment(this.currentIndex);
            } else {
                if (this.callbacks.onSegmentChange) {
                    this.callbacks.onSegmentChange(this.segments[this.currentIndex], this.currentIndex);
                }
            }
        }
    }

    /**
     * 通知播放状态变化
     */
    _notifyPlayStateChange(state) {
        Logger.debug('播放状态变化:', state);

        if (this.callbacks.onPlayStateChange) {
            this.callbacks.onPlayStateChange(state, {
                isPlaying: this.isPlaying,
                isPaused: this.isPaused,
                currentIndex: this.currentIndex,
                totalSegments: this.segments.length
            });
        }
    }

    /**
     * 获取当前状态
     */
    getState() {
        return {
            currentCourse: this.currentCourse,
            segments: this.segments,
            currentIndex: this.currentIndex,
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            progress: this.segments.length > 0
                ? ((this.currentIndex + 1) / this.segments.length) * 100
                : 0
        };
    }

    /**
     * 获取当前片段
     */
    getCurrentSegment() {
        return this.segments[this.currentIndex] || null;
    }

    /**
     * 注册回调
     */
    on(event, callback) {
        const callbackKey = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;

        if (this.callbacks.hasOwnProperty(callbackKey)) {
            this.callbacks[callbackKey] = callback;
        } else {
            Logger.warn(`未知的事件: ${event}`);
        }
    }

    /**
     * 重置播放器
     */
    reset() {
        this.stop();
        this.currentCourse = null;
        this.segments = [];
        this.currentIndex = 0;
        Logger.info('播放器已重置');
    }
}

// 导出到全局
window.CoursePlayer = CoursePlayer;
