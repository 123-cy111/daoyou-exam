// 导游测试系统 - 移动端优化版
console.log("系统初始化开始...");

// 全局变量
let currentQuestions = [];
let userAnswers = [];
let usedJudgementIds = [];
let usedSingleIds = [];
let usedMultipleIds = [];

// 移动端检测
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM加载完成");
    console.log("移动端设备:", isMobile);
    
    // 初始化移动端触摸支持
    if (isMobile) {
        initMobileSupport();
    }
    
    // 检查题库是否加载
    checkDataLoaded();
});

// 检查数据加载状态
function checkDataLoaded() {
    const checkInterval = setInterval(() => {
        const judgementLoaded = typeof judgementQuestions !== 'undefined' && judgementQuestions.length > 0;
        const singleLoaded = typeof singleChoiceQuestions !== 'undefined' && singleChoiceQuestions.length > 0;
        const multipleLoaded = typeof multipleChoiceQuestions !== 'undefined' && multipleChoiceQuestions.length > 0;
        
        if (judgementLoaded && singleLoaded && multipleLoaded) {
            clearInterval(checkInterval);
            console.log("所有题库加载成功!");
            generateQuiz();
        } else {
            console.log("等待题库加载...");
        }
    }, 100);
    
    // 10秒后超时
    setTimeout(() => {
        clearInterval(checkInterval);
        const judgementLoaded = typeof judgementQuestions !== 'undefined' && judgementQuestions.length > 0;
        const singleLoaded = typeof singleChoiceQuestions !== 'undefined' && singleChoiceQuestions.length > 0;
        const multipleLoaded = typeof multipleChoiceQuestions !== 'undefined' && multipleChoiceQuestions.length > 0;
        
        if (!judgementLoaded || !singleLoaded || !multipleLoaded) {
            console.error("题库加载超时");
            showErrorMessage("题库加载失败，请刷新页面重试");
        }
    }, 10000);
}

// 移动端支持初始化
function initMobileSupport() {
    console.log("初始化移动端支持");
    
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    // 改善触摸体验
    document.addEventListener('touchstart', function() {}, { passive: true });
}

// 显示错误信息
function showErrorMessage(message) {
    const container = document.getElementById('quiz-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #dc3545;">
                <h3>系统错误</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #dc3545; color: white; border: none; border-radius: 5px;">刷新页面</button>
            </div>
        `;
    }
    
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.innerHTML = `<p style="color: red;">${message}</p>`;
    }
}

// 随机选择题目
function getRandomQuestions() {
    console.log("开始随机选择题目...");
    
    try {
        // 重置使用记录（如果所有题目都已使用过）
        if (usedJudgementIds.length >= judgementQuestions.length) {
            usedJudgementIds = [];
        }
        if (usedSingleIds.length >= singleChoiceQuestions.length) {
            usedSingleIds = [];
        }
        if (usedMultipleIds.length >= multipleChoiceQuestions.length) {
            usedMultipleIds = [];
        }
        
        // 获取未使用过的题目
        const availableJudgement = judgementQuestions.filter(q => !usedJudgementIds.includes(q.id));
        const availableSingle = singleChoiceQuestions.filter(q => !usedSingleIds.includes(q.id));
        const availableMultiple = multipleChoiceQuestions.filter(q => !usedMultipleIds.includes(q.id));
        
        console.log(`可用题目 - 判断: ${availableJudgement.length}, 单选: ${availableSingle.length}, 多选: ${availableMultiple.length}`);
        
        // 随机选择题目
        const randomJudgement = [...availableJudgement].sort(() => 0.5 - Math.random()).slice(0, 2);
        const randomSingle = [...availableSingle].sort(() => 0.5 - Math.random()).slice(0, 2);
        const randomMultiple = [...availableMultiple].sort(() => 0.5 - Math.random()).slice(0, 1);
        
        // 记录已使用的题目
        randomJudgement.forEach(q => usedJudgementIds.push(q.id));
        randomSingle.forEach(q => usedSingleIds.push(q.id));
        randomMultiple.forEach(q => usedMultipleIds.push(q.id));
        
        const selectedQuestions = [...randomJudgement, ...randomSingle, ...randomMultiple];
        console.log(`最终选择 ${selectedQuestions.length} 道题目`);
        
        return selectedQuestions;
        
    } catch (error) {
        console.error("选择题目时出错:", error);
        return [];
    }
}

// 生成测验界面
function generateQuiz() {
    console.log("开始生成测验界面...");
    
    try {
        currentQuestions = getRandomQuestions();
        
        if (currentQuestions.length === 0) {
            showErrorMessage("无法获取题目，请检查数据文件");
            return;
        }
        
        userAnswers = new Array(currentQuestions.length).fill('');
        
        const container = document.getElementById('quiz-container');
        const loadingMessage = document.getElementById('loading-message');
        
        if (!container) {
            console.error("错误: 找不到quiz-container元素");
            return;
        }
        
        // 清空容器
        container.innerHTML = '';
        
        // 隐藏加载消息
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }
        
        // 更新分数和进度显示
        updateScoreDisplay(0);
        updateProgressDisplay(0);
        
        console.log(`准备显示 ${currentQuestions.length} 道题目`);
        
        // 生成题目
        currentQuestions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            questionDiv.id = `q${index}`;
            
            if (question.options) {
                // 单选题或多选题
                const isMultiple = question.answer.length > 1;
                const inputType = isMultiple ? 'checkbox' : 'radio';
                
                questionDiv.innerHTML = `
                    <p><strong>第${index + 1}题</strong>：${question.question}</p>
                    <div class="options">
                        ${question.options.map(option => `
                            <label class="option">
                                <input type="${inputType}" name="q${index}" value="${option.charAt(0)}" onchange="updateAnswer(${index})">
                                ${option}
                            </label>
                        `).join('')}
                    </div>
                    <div class="answer" id="answer${index}" style="display:none;"></div>
                    <div class="hint" id="hint${index}" style="display:none;"></div>
                `;
            } else {
                // 判断题
                questionDiv.innerHTML = `
                    <p><strong>第${index + 1}题</strong>：${question.question}</p>
                    <div class="options">
                        <label class="option">
                            <input type="radio" name="q${index}" value="A" onchange="updateAnswer(${index})"> 正确
                        </label>
                        <label class="option">
                            <input type="radio" name="q${index}" value="B" onchange="updateAnswer(${index})"> 错误
                        </label>
                    </div>
                    <div class="answer" id="answer${index}" style="display:none;"></div>
                    <div class="hint" id="hint${index}" style="display:none;"></div>
                `;
            }
            
            container.appendChild(questionDiv);
        });
        
        console.log("题目生成完成");
        
    } catch (error) {
        console.error("生成测验时出错:", error);
        showErrorMessage("系统初始化失败: " + error.message);
    }
}

// 更新分数显示
function updateScoreDisplay(score) {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

// 更新进度显示
function updateProgressDisplay(progress) {
    const progressElement = document.getElementById('progress');
    if (progressElement) {
        progressElement.textContent = progress;
    }
}

// 更新用户答案
function updateAnswer(index) {
    try {
        const question = currentQuestions[index];
        
        if (question.options) {
            const isMultiple = question.answer.length > 1;
            
            if (isMultiple) {
                const selected = document.querySelectorAll(`input[name="q${index}"]:checked`);
                userAnswers[index] = Array.from(selected).map(input => input.value).sort().join('');
            } else {
                const selected = document.querySelector(`input[name="q${index}"]:checked`);
                userAnswers[index] = selected ? selected.value : '';
            }
        } else {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            userAnswers[index] = selected ? selected.value : '';
        }
        
        const answeredCount = userAnswers.filter(answer => answer !== '').length;
        updateProgressDisplay(answeredCount);
        
    } catch (error) {
        console.error("更新答案时出错:", error);
    }
}

// 检查答案
function checkAnswers() {
    try {
        let score = 0;
        const results = document.getElementById('results');
        
        if (results) {
            results.innerHTML = '<h3>测试结果：</h3>';
            results.style.display = 'block';
        }
        
        currentQuestions.forEach((question, index) => {
            const userAnswer = userAnswers[index] || '未作答';
            const isCorrect = userAnswer === question.answer;
            
            if (isCorrect) {
                score += 2;
            }
            
            const answerDiv = document.getElementById(`answer${index}`);
            if (answerDiv) {
                if (isCorrect) {
                    answerDiv.innerHTML = `<span class="correct">✓ 正确！你的答案：${userAnswer}</span>`;
                } else {
                    answerDiv.innerHTML = `<span class="incorrect">✗ 错误！你的答案：${userAnswer}，正确答案：${question.answer}</span>`;
                }
                answerDiv.style.display = 'block';
            }
        });
        
        updateScoreDisplay(score);
        
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.style.display = 'inline-block';
        }
        
    } catch (error) {
        console.error("检查答案时出错:", error);
        alert("评分时出现错误，请刷新页面重试");
    }
}

// 显示解析
function showHints() {
    try {
        currentQuestions.forEach((question, index) => {
            const hintDiv = document.getElementById(`hint${index}`);
            if (hintDiv && question.hint) {
                hintDiv.innerHTML = `<strong>解析：</strong>${question.hint}`;
                hintDiv.style.display = 'block';
            }
        });
    } catch (error) {
        console.error("显示解析时出错:", error);
    }
}

// 重置测验
function resetQuiz() {
    try {
        generateQuiz();
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.style.display = 'none';
        }
        
        const results = document.getElementById('results');
        if (results) {
            results.style.display = 'none';
        }
    } catch (error) {
        console.error("重置测验时出错:", error);
    }
}

// 页面可见性变化处理（针对移动端）
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时，检查状态
        console.log("页面重新激活");
    }
});

console.log("脚本加载完成");
