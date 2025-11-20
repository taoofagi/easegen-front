/**
 * 主入口文件
 * 初始化应用并连接所有组件
 */

// 全局状态
let xmovManager = null;
let coursePlayer = null;
let uiController = null;

/**
 * 应用初始化
 */
async function initializeApp() {
    try {
        Logger.info('🚀 应用启动...');

        // 1. 创建 Xmov 管理器
        xmovManager = new XmovManager();

        // 2. 创建播放器（需要先创建，后面会用到）
        coursePlayer = new CoursePlayer(xmovManager);

        // 3. 创建 UI 控制器（需要先创建，以便隐藏加载状态）
        uiController = new UIController(coursePlayer);

        // 4. 初始化 Xmov SDK
        Logger.info('初始化数字人 SDK...');
        await xmovManager.initialize();

        Logger.info('✅ 数字人 SDK 初始化成功');

        // 手动隐藏加载状态（因为 ready 事件可能在事件监听器注册前就触发了）
        if (uiController && uiController.avatarLoading) {
            uiController.avatarLoading.style.display = 'none';
        }

        // 5. 绑定事件
        setupEventBindings();

        // 6. 加载课程列表
        await uiController.loadCourses();

        Logger.info('✅ 应用初始化完成');

    } catch (error) {
        Logger.error('❌ 应用初始化失败:', error);
        showErrorState(error);
    }
}

/**
 * 设置事件绑定
 */
function setupEventBindings() {
    // Xmov 事件
    xmovManager.on('ready', () => {
        Logger.info('[Event] Xmov SDK 就绪');
        uiController.updateAvatarStatus('idle', '就绪');
    });

    xmovManager.on('voiceStart', () => {
        Logger.info('[Event] 开始说话');
        uiController.updateAvatarStatus('speaking', '正在讲解');
    });

    xmovManager.on('voiceEnd', () => {
        Logger.info('[Event] 说话结束');
        uiController.updateAvatarStatus('idle', '就绪');
    });

    xmovManager.on('error', (error) => {
        Logger.error('[Event] Xmov 错误:', error);
        uiController.showToast('数字人错误: ' + error.message, 'error');
    });

    // 播放器事件
    coursePlayer.on('courseLoaded', (course, segments) => {
        Logger.info('[Event] 课程已加载:', course);
        uiController.updateCourseInfo(course);

        // 默认显示第一个片段
        if (segments.length > 0) {
            uiController.updateSegmentDisplay(segments[0], 0, segments.length);
        }
    });

    coursePlayer.on('segmentChange', (segment, index) => {
        Logger.info('[Event] 片段切换:', segment.no);
        const total = coursePlayer.segments.length;
        uiController.updateSegmentDisplay(segment, index, total);
    });

    coursePlayer.on('playStateChange', (state, info) => {
        Logger.info('[Event] 播放状态:', state);

        switch (state) {
            case 'playing':
                uiController.updatePlayButton(true);
                uiController.showToast('开始播放', 'info');
                break;

            case 'paused':
                uiController.updatePlayButton(false);
                uiController.showToast('已暂停', 'info');
                break;

            case 'stopped':
                uiController.updatePlayButton(false);
                uiController.updateProgress(0);
                uiController.showToast('已停止', 'info');
                break;

            case 'completed':
                uiController.updatePlayButton(false);
                uiController.showToast('播放完成', 'success');
                break;
        }
    });

    coursePlayer.on('complete', (course) => {
        Logger.info('[Event] 课程播放完成:', course.name);
        // 可以在这里添加播放完成后的逻辑
    });

    coursePlayer.on('error', (error) => {
        Logger.error('[Event] 播放器错误:', error);
        uiController.showToast('播放错误: ' + error.message, 'error');
    });

    // Xmov 加载进度事件
    window.addEventListener('xmov:loading', (event) => {
        const { progress } = event.detail;
        Logger.debug('[Event] Xmov 加载进度:', progress);

        // 可以更新加载进度 UI
        if (progress < 100) {
            uiController.updateAvatarStatus('loading', `加载中 ${progress}%`);
        }
    });
}

/**
 * 显示错误状态
 */
function showErrorState(error) {
    const errorMessage = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            text-align: center;
            z-index: 9999;
        ">
            <h2 style="color: #ff3b30; margin-bottom: 20px;">初始化失败</h2>
            <p style="color: #1d1d1f; margin-bottom: 20px;">${error.message}</p>
            <button onclick="location.reload()" style="
                padding: 12px 24px;
                background: #007aff;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 15px;
            ">重新加载</button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', errorMessage);
}

/**
 * 页面加载完成后初始化
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// 导出到全局（用于调试）
window.app = {
    xmovManager,
    coursePlayer,
    uiController,

    // 调试方法
    getState() {
        return {
            xmov: xmovManager?.getState(),
            player: coursePlayer?.getState()
        };
    },

    reload() {
        location.reload();
    }
};

Logger.info('main.js 已加载');
