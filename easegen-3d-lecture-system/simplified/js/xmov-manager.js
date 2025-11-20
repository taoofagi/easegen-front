/**
 * Xmov SDK 管理器
 * 负责 3D 数字人的初始化和控制
 */

class XmovManager {
    constructor() {
        this.sdk = null;
        this.isReady = false;
        this.config = null;
        this.currentState = 'idle'; // 'idle' | 'loading' | 'speaking' | 'error'

        this.callbacks = {
            onReady: null,
            onError: null,
            onVoiceStart: null,
            onVoiceEnd: null,
            onStateChange: null
        };
    }

    /**
     * 初始化 Xmov SDK
     */
    async initialize() {
        try {
            // 检查 SDK 是否已加载
            if (typeof XmovAvatar === 'undefined') {
                throw new Error('Xmov SDK 未加载。请检查网络连接。');
            }

            Logger.info('开始初始化 Xmov SDK...');

            // 1. 获取配置（带重试机制）
            this.config = await this._fetchConfigWithRetry(3);

            if (!this.config || !this.config.appId || !this.config.appSecret) {
                throw new Error('Xmov 配置缺失，请检查后端服务');
            }

            Logger.info('Xmov 配置已获取:', {
                appId: this.config.appId,
                appSecret: '***'
            });

            // 2. 创建 SDK 实例
            this.sdk = new XmovAvatar({
                containerId: CONFIG.XMOV.CONTAINER_ID,
                appId: this.config.appId,
                appSecret: this.config.appSecret,
                gatewayServer: CONFIG.XMOV.GATEWAY_SERVER,

                // 事件回调
                onWidgetEvent: (data) => {
                    Logger.debug('[Xmov] Widget事件:', data);
                },

                onNetworkInfo: (networkInfo) => {
                    Logger.debug('[Xmov] 网络信息:', networkInfo);
                },

                onMessage: (message) => {
                    Logger.debug('[Xmov] SDK消息:', message);
                },

                onStateChange: (state) => {
                    Logger.debug('[Xmov] 状态变化:', state);
                    this._handleStateChange(state);
                },

                onStatusChange: (status) => {
                    Logger.debug('[Xmov] SDK状态:', status);
                },

                onStateRenderChange: (state, duration) => {
                    Logger.debug('[Xmov] 渲染状态:', state, duration);
                },

                onVoiceStateChange: (status) => {
                    Logger.info('[Xmov] 音频状态:', status);
                    this._handleVoiceStateChange(status);
                },

                enableLogger: CONFIG.XMOV.ENABLE_LOGGER
            });

            // 3. 初始化 SDK
            await this.sdk.init({
                onDownloadProgress: (progress) => {
                    Logger.info(`[Xmov] 资源加载进度: ${progress}%`);
                    this._updateLoadingProgress(progress);
                },

                onError: (error) => {
                    Logger.error('[Xmov] SDK错误:', error);
                    this._handleError(error);
                },

                onClose: () => {
                    Logger.warn('[Xmov] SDK连接关闭');
                    this.isReady = false;
                    this.currentState = 'error';
                }
            });

            this.isReady = true;
            this.currentState = 'idle';
            Logger.info('✅ Xmov SDK 初始化成功');

            // 触发就绪回调
            if (this.callbacks.onReady) {
                this.callbacks.onReady();
            }

        } catch (error) {
            Logger.error('❌ Xmov SDK 初始化失败:', error);
            this.currentState = 'error';

            // 显示用户友好的错误信息
            this._showError(error.message);

            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }

            throw error;
        }
    }

    /**
     * 获取 Xmov 配置
     */
    async _fetchConfig() {
        try {
            const response = await api.get(CONFIG.API.ENDPOINTS.XMOV_CONFIG);

            if (response.code === 0 && response.data) {
                return response.data;
            } else {
                throw new Error(response.message || '获取配置失败');
            }
        } catch (error) {
            Logger.error('获取 Xmov 配置失败:', error);
            throw error;
        }
    }

    /**
     * 带重试的配置获取
     * @param {number} maxRetries - 最大重试次数
     */
    async _fetchConfigWithRetry(maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await this._fetchConfig();
            } catch (error) {
                if (i === maxRetries - 1) {
                    // 最后一次重试失败，抛出错误
                    throw error;
                }
                Logger.warn(`配置获取失败，重试 ${i + 1}/${maxRetries}...`);
                // 等待 2 秒后重试
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    /**
     * 显示用户友好的错误信息
     * @param {string} message - 错误消息
     */
    _showError(message) {
        const container = document.getElementById('avatarContainer');
        if (container) {
            container.innerHTML = `
                <div style="
                    padding: 40px;
                    text-align: center;
                    color: #ff3b30;
                ">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" style="margin: 0 auto; opacity: 0.8;">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <h3 style="margin-top: 16px; font-size: 18px; font-weight: 600; color: var(--text-primary);">数字人加载失败</h3>
                    <p style="margin-top: 8px; color: var(--text-secondary); font-size: 14px;">${message}</p>
                    <button onclick="location.reload()" style="
                        margin-top: 24px;
                        padding: 12px 24px;
                        background: var(--primary);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: opacity 0.2s;
                    " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">重新加载</button>
                </div>
            `;
        }
    }

    /**
     * 驱动数字人说话
     * @param {string} text - 要说的文本
     */
    async speak(text) {
        if (!this.isReady) {
            Logger.warn('SDK 未就绪，无法播放');
            return Promise.reject(new Error('SDK 未就绪'));
        }

        if (!text || typeof text !== 'string') {
            Logger.warn('无效的文本内容');
            return Promise.reject(new Error('无效的文本内容'));
        }

        try {
            Logger.info(`[Xmov] 开始播放: ${text.substring(0, 30)}...`);

            // 调用 SDK speak 方法
            // 参数: speak(text, isFirst, isEnd)
            this.sdk.speak(text, true, true);

            // 返回 Promise，在 onVoiceEnd 时 resolve
            return new Promise((resolve, reject) => {
                const originalOnVoiceEnd = this.callbacks.onVoiceEnd;

                this.callbacks.onVoiceEnd = () => {
                    // 恢复原始回调
                    this.callbacks.onVoiceEnd = originalOnVoiceEnd;

                    // 执行原始回调
                    if (originalOnVoiceEnd) {
                        originalOnVoiceEnd();
                    }

                    // resolve Promise
                    resolve();
                };
            });

        } catch (error) {
            Logger.error('播放失败:', error);
            throw error;
        }
    }

    /**
     * 停止说话
     */
    stop() {
        if (this.sdk && this.isReady) {
            try {
                // Xmov SDK 可能没有提供 stop 方法
                // 这里只是示意，具体要看 SDK 文档
                Logger.info('[Xmov] 停止播放');
                this.currentState = 'idle';
            } catch (error) {
                Logger.error('停止播放失败:', error);
            }
        }
    }

    /**
     * 处理语音状态变化
     */
    _handleVoiceStateChange(status) {
        if (status === 'start') {
            this.currentState = 'speaking';

            if (this.callbacks.onVoiceStart) {
                this.callbacks.onVoiceStart();
            }

        } else if (status === 'end') {
            this.currentState = 'idle';

            if (this.callbacks.onVoiceEnd) {
                this.callbacks.onVoiceEnd();
            }
        }

        // 触发通用状态回调
        if (this.callbacks.onStateChange) {
            this.callbacks.onStateChange(this.currentState);
        }
    }

    /**
     * 处理 SDK 状态变化
     */
    _handleStateChange(state) {
        // 可以在这里处理各种状态
        Logger.debug('SDK 状态:', state);
    }

    /**
     * 更新加载进度
     */
    _updateLoadingProgress(progress) {
        // 可以通过事件通知 UI 更新进度
        const event = new CustomEvent('xmov:loading', {
            detail: { progress }
        });
        window.dispatchEvent(event);
    }

    /**
     * 处理错误
     */
    _handleError(error) {
        this.currentState = 'error';

        if (this.callbacks.onError) {
            this.callbacks.onError(error);
        }

        // 发送错误事件
        const event = new CustomEvent('xmov:error', {
            detail: { error }
        });
        window.dispatchEvent(event);
    }

    /**
     * 注册回调函数
     */
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
            this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
        } else {
            Logger.warn(`未知的事件: ${event}`);
        }
    }

    /**
     * 获取当前状态
     */
    getState() {
        return {
            isReady: this.isReady,
            currentState: this.currentState,
            hasConfig: !!this.config
        };
    }

    /**
     * 销毁 SDK
     */
    destroy() {
        if (this.sdk) {
            try {
                // 如果 SDK 有 destroy 方法
                if (typeof this.sdk.destroy === 'function') {
                    this.sdk.destroy();
                }

                this.sdk = null;
                this.isReady = false;
                this.currentState = 'idle';

                Logger.info('Xmov SDK 已销毁');
            } catch (error) {
                Logger.error('销毁 SDK 失败:', error);
            }
        }
    }
}

// 导出到全局
window.XmovManager = XmovManager;
