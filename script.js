// 全局变量
let currentQuestions = [];
let userAnswers = [];

// 添加全局变量来跟踪已使用的题目
let usedJudgementIds = [];
let usedSingleIds = [];
let usedMultipleIds = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    generateQuiz();
});

// 改进的随机选择函数，优先选择未使用过的题目
function getRandomQuestions() {
    // 如果某个类别的题目已用完，重置记录
    if (usedJudgementIds.length >= judgementQuestions.length) {
        usedJudgementIds = [];
    }
    if (usedSingleIds.length >= singleChoiceQuestions.length) {
        usedSingleIds = [];
    }
    if (usedMultipleIds.length >= multipleChoiceQuestions.length) {
        usedMultipleIds = [];
    }
    
    // 获取未使用过的判断题
    const availableJudgement = judgementQuestions.filter(q => !usedJudgementIds.includes(q.id));
    const randomJudgement = [...availableJudgement]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
    
    // 获取未使用过的单选题
    const availableSingle = singleChoiceQuestions.filter(q => !usedSingleIds.includes(q.id));
    const randomSingle = [...availableSingle]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
    
    // 获取未使用过的多选题
    const availableMultiple = multipleChoiceQuestions.filter(q => !usedMultipleIds.includes(q.id));
    const randomMultiple = [...availableMultiple]
        .sort(() => 0.5 - Math.random())
        .slice(0, 1);
    
    // 记录已使用的题目ID
    randomJudgement.forEach(q => usedJudgementIds.push(q.id));
    randomSingle.forEach(q => usedSingleIds.push(q.id));
    randomMultiple.forEach(q => usedMultipleIds.push(q.id));
    
    return [...randomJudgement, ...randomSingle, ...randomMultiple];
}

// 生成测验界面
function generateQuiz() {
    currentQuestions = getRandomQuestions();
    userAnswers = new Array(currentQuestions.length).fill('');
    
    const container = document.getElementById('quiz-container');
    const results = document.getElementById('results');
    results.innerHTML = '';
    results.style.display = 'none';
    
    container.innerHTML = '';
    document.getElementById('score').textContent = '0';
    document.getElementById('progress').textContent = '0';
    
    // 显示使用统计
    updateUsageStats();
    
    currentQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.id = `q${index}`;
        
        let optionsHTML = '';
        
        if (question.options) {
            // 单选题或多选题
            const isMultiple = question.answer.length > 1;
            questionDiv.innerHTML = `
                <p>${index + 1}. ${question.question}</p>
                <div class="options">
                    ${question.options.map(option => `
                        <label class="option">
                            <input type="${isMultiple ? 'checkbox' : 'radio'}" 
                                   name="q${index}" 
                                   value="${option.charAt(0)}"
                                   onchange="updateAnswer(${index})">
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
                <p>${index + 1}. ${question.question}</p>
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
}

// 更新使用统计显示
function updateUsageStats() {
    const statsElement = document.getElementById('usage-stats');
    if (!statsElement) {
        // 创建统计显示元素
        const statsDiv = document.createElement('div');
        statsDiv.id = 'usage-stats';
        statsDiv.className = 'usage-stats';
        statsDiv.innerHTML = `
            <div class="stat-item">
                <span>判断题: ${usedJudgementIds.length}/${judgementQuestions.length}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(usedJudgementIds.length / judgementQuestions.length) * 100}%"></div>
                </div>
            </div>
            <div class="stat-item">
                <span>单选题: ${usedSingleIds.length}/${singleChoiceQuestions.length}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(usedSingleIds.length / singleChoiceQuestions.length) * 100}%"></div>
                </div>
            </div>
            <div class="stat-item">
                <span>多选题: ${usedMultipleIds.length}/${multipleChoiceQuestions.length}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(usedMultipleIds.length / multipleChoiceQuestions.length) * 100}%"></div>
                </div>
            </div>
        `;
        
        // 将统计信息插入到分数板后面
        const scoreBoard = document.querySelector('.score-board');
        scoreBoard.parentNode.insertBefore(statsDiv, scoreBoard.nextSibling);
    } else {
        // 更新现有统计信息
        statsElement.innerHTML = `
            <div class="stat-item">
                <span>判断题: ${usedJudgementIds.length}/${judgementQuestions.length}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(usedJudgementIds.length / judgementQuestions.length) * 100}%"></div>
                </div>
            </div>
            <div class="stat-item">
                <span>单选题: ${usedSingleIds.length}/${singleChoiceQuestions.length}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(usedSingleIds.length / singleChoiceQuestions.length) * 100}%"></div>
                </div>
            </div>
            <div class="stat-item">
                <span>多选题: ${usedMultipleIds.length}/${multipleChoiceQuestions.length}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(usedMultipleIds.length / multipleChoiceQuestions.length) * 100}%"></div>
                </div>
            </div>
        `;
    }
}

// 更新用户答案
function updateAnswer(index) {
    const question = currentQuestions[index];
    
    if (question.options) {
        const isMultiple = question.answer.length > 1;
        
        if (isMultiple) {
            // 多选题
            const selected = document.querySelectorAll(`input[name="q${index}"]:checked`);
            userAnswers[index] = Array.from(selected).map(input => input.value).sort().join('');
        } else {
            // 单选题
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            userAnswers[index] = selected ? selected.value : '';
        }
    } else {
        // 判断题
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        userAnswers[index] = selected ? selected.value : '';
    }
    
    // 更新进度
    const answeredCount = userAnswers.filter(answer => answer !== '').length;
    document.getElementById('progress').textContent = answeredCount;
}

// 检查答案
function checkAnswers() {
    let score = 0;
    const results = document.getElementById('results');
    results.innerHTML = '<h3>测试结果：</h3>';
    results.style.display = 'block';
    
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index] || '未作答';
        const isCorrect = userAnswer === question.answer;
        
        const answerDiv = document.getElementById(`answer${index}`);
        
        if (isCorrect) {
            score += 2;
            answerDiv.innerHTML = `<span class="correct">✓ 正确！你的答案：${userAnswer}</span>`;
        } else {
            answerDiv.innerHTML = `<span class="incorrect">✗ 错误！你的答案：${userAnswer}，正确答案：${question.answer}</span>`;
        }
        
        answerDiv.style.display = 'block';
        
        // 添加到结果汇总
        const resultItem = document.createElement('div');
        resultItem.className = `question-result ${isCorrect ? 'correct' : 'incorrect'}`;
        resultItem.innerHTML = `
            <p><strong>第${index + 1}题：</strong>${question.question}</p>
            <p>你的答案：${userAnswer} | 正确答案：${question.answer}</p>
        `;
        results.appendChild(resultItem);
    });
    
    document.getElementById('score').textContent = score;
    
    // 显示提示按钮
    document.getElementById('hint-btn').style.display = 'inline-block';
}

// 显示解析
function showHints() {
    currentQuestions.forEach((question, index) => {
        const hintDiv = document.getElementById(`hint${index}`);
        if (question.hint) {
            hintDiv.innerHTML = `<strong>解析：</strong>${question.hint}`;
            hintDiv.style.display = 'block';
        }
    });
}

// 重置测验
function resetQuiz() {
    generateQuiz();
    document.getElementById('hint-btn').style.display = 'none';
}

// 清空使用记录
function clearHistory() {
    usedJudgementIds = [];
    usedSingleIds = [];
    usedMultipleIds = [];
    resetQuiz();
    alert('使用记录已清空，将重新开始随机抽题！');
}