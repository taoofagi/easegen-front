/**
 * 配置文件
 * 集中管理所有配置项
 */

const CONFIG = {
    // ========== API 配置 ==========
    API: {
        BASE_URL: 'http://127.0.0.1:7000',
        ENDPOINTS: {
            COURSES: '/api/courses',
            COURSE_DETAIL: '/api/course',
            SEGMENTS: '/api/segments',
            XMOV_CONFIG: '/api/xmov-config'
        }
    },

    // ========== Xmov SDK 配置 ==========
    XMOV: {
        GATEWAY_SERVER: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',
        CONTAINER_ID: '#digital-human',
        ENABLE_LOGGER: true
    },

    // ========== 播放器配置 ==========
    PLAYER: {
        // 自动播放下一段
        AUTO_PLAY_NEXT: true,

        // 段落之间的间隔（毫秒）
        SEGMENT_DELAY: 500,

        // 默认音量（0-100）
        DEFAULT_VOLUME: 80,

        // 是否显示 PPT 信息覆盖层
        SHOW_PPT_OVERLAY: true
    },

    // ========== UI 配置 ==========
    UI: {
        // Toast 持续时间（毫秒）
        TOAST_DURATION: 3000,

        // 课程列表每页数量
        COURSES_PER_PAGE: 20,

        // 主题（'light' | 'dark' | 'auto'）
        DEFAULT_THEME: 'auto'
    },

    // ========== 调试配置 ==========
    DEBUG: {
        // 是否启用调试模式
        ENABLED: true,

        // 日志级别（'debug' | 'info' | 'warn' | 'error'）
        LOG_LEVEL: 'info',

        // 是否在控制台显示 API 请求
        LOG_API_REQUESTS: true
    }
};

// 冻结配置，防止被修改
Object.freeze(CONFIG);
Object.freeze(CONFIG.API);
Object.freeze(CONFIG.API.ENDPOINTS);
Object.freeze(CONFIG.XMOV);
Object.freeze(CONFIG.PLAYER);
Object.freeze(CONFIG.UI);
Object.freeze(CONFIG.DEBUG);

/**
 * 日志工具
 */
const Logger = {
    _shouldLog(level) {
        if (!CONFIG.DEBUG.ENABLED) return false;

        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevel = levels.indexOf(CONFIG.DEBUG.LOG_LEVEL);
        const messageLevel = levels.indexOf(level);

        return messageLevel >= currentLevel;
    },

    debug(...args) {
        if (this._shouldLog('debug')) {
            console.log('[DEBUG]', ...args);
        }
    },

    info(...args) {
        if (this._shouldLog('info')) {
            console.info('[INFO]', ...args);
        }
    },

    warn(...args) {
        if (this._shouldLog('warn')) {
            console.warn('[WARN]', ...args);
        }
    },

    error(...args) {
        if (this._shouldLog('error')) {
            console.error('[ERROR]', ...args);
        }
    },

    api(method, url, data) {
        if (CONFIG.DEBUG.LOG_API_REQUESTS) {
            console.log(
                `%c[API] ${method} ${url}`,
                'color: #007aff; font-weight: bold;',
                data || ''
            );
        }
    }
};

/**
 * API 客户端
 */
class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async _fetch(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const method = options.method || 'GET';

        Logger.api(method, endpoint, options.body);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            Logger.error('API 请求失败:', error);
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this._fetch(url, { method: 'GET' });
    }

    async post(endpoint, data = {}) {
        return this._fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this._fetch(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this._fetch(endpoint, { method: 'DELETE' });
    }
}

// 创建全局 API 客户端实例
const api = new APIClient(CONFIG.API.BASE_URL);

/**
 * 工具函数
 */
const Utils = {
    /**
     * 格式化时间（秒 -> MM:SS）
     */
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * 防抖函数
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * 生成唯一 ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * 深拷贝对象
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * 等待指定时间
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// 导出到全局（用于其他脚本）
window.CONFIG = CONFIG;
window.Logger = Logger;
window.api = api;
window.Utils = Utils;
