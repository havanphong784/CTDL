const dictionaryData = [
    { term: "Algorithm", def: "Thuật toán" },
    { term: "Data Structure", def: "Cấu trúc dữ liệu" },
    { term: "Time Complexity", def: "Độ phức tạp thời gian" },
    { term: "Space Complexity", def: "Độ phức tạp không gian" },
    { term: "Array", def: "Mảng" },
    { term: "Linked List", def: "Danh sách liên kết" },
    { term: "Stack", def: "Ngăn xếp" },
    { term: "Queue", def: "Hàng đợi" },
    { term: "Tree", def: "Cây" },
    { term: "Graph", def: "Đồ thị" },
    { term: "Node", def: "Nút / Đỉnh" },
    { term: "Edge", def: "Cạnh" },
    { term: "Sorting", def: "Sắp xếp" },
    { term: "Searching", def: "Tìm kiếm" },
    { term: "Recursion", def: "Đệ quy" },
    { term: "Dynamic Programming", def: "Quy hoạch động" },
    { term: "Greedy Algorithm", def: "Thuật toán tham lam" },
    { term: "Divide and Conquer", def: "Chia để trị" },
    { term: "Hash Table", def: "Bảng băm" },
    { term: "Binary Search", def: "Tìm kiếm nhị phân" },
    { term: "Upper Bound", def: "Cận trên (O-lớn)" },
    { term: "Lower Bound", def: "Cận dưới (Omega-lớn)" },
    { term: "Tight Bound", def: "Cận chặt (Theta-lớn)" },
    { term: "Constant Time", def: "Thời gian hằng số (O(1))" },
    { term: "Linear Time", def: "Thời gian tuyến tính (O(n))" },
    { term: "Quadratic Time", def: "Thời gian bậc hai (O(n^2))" },
    { term: "Asymptotic Notation", def: "Ký pháp tiệm cận" }
];

const availablePacks = [
    {
        id: "algo_analysis",
        title: "Phân tích thuật toán",
        desc: "Đánh giá độ phức tạp O-lớn, Omega và Theta.",
        file: "./src/data/Algorithm_Analysis.json",
        count: 20,
        accent: "blue"
    },
    {
        id: "linked_lists",
        title: "Danh sách liên kết",
        desc: "Singly, Doubly, Circular Linked Lists và ứng dụng.",
        file: "./src/data/Linked_Lists.json",
        count: 50,
        accent: "teal"
    },
    {
        id: "stacks_queues",
        title: "Ngăn xếp & Hàng đợi",
        desc: "Cấu trúc LIFO/FIFO, cài đặt bằng mảng và danh sách liên kết.",
        file: "./src/data/Stacks-Queues.json",
        count: 50,
        accent: "amber"
    },
    {
        id: "search_sort",
        title: "Tìm kiếm & Sắp xếp",
        desc: "Sequential, Binary Search và các thuật toán sắp xếp cơ bản.",
        file: "./src/data/Searching_Sorting.json",
        count: 50,
        accent: "violet"
    },
    {
        id: "trees",
        title: "Cây (Trees)",
        desc: "Binary Trees, Binary Search Trees và Forests.",
        file: "./src/data/Trees.json",
        count: 50,
        accent: "blue"
    },
    {
        id: "heaps",
        title: "Hàng đợi ưu tiên (Heap)",
        desc: "Max/Min Heap, Heap Sort và các thao tác cơ bản.",
        file: "./src/data/Heaps.json",
        count: 50,
        accent: "teal"
    },
    {
        id: "graphs",
        title: "Đồ thị (Graphs)",
        desc: "Thuật ngữ, biểu diễn đồ thị và các thuật toán duyệt BFS/DFS.",
        file: "./src/data/Graphs.json",
        count: 50,
        accent: "amber"
    },
    {
        id: "hash_table",
        title: "Bảng băm (Hash Table)",
        desc: "Static Hashing, Dynamic Hashing và giải quyết xung đột.",
        file: "./src/data/Hash_Table.json",
        count: 50,
        accent: "violet"
    }
];

const STORAGE_STATS_KEY = "ctdlgt_quiz_stats_v1";
const translationCache = new Map();
const sentenceCache = new Map();
const stopWords = new Set(["the", "is", "at", "which", "on", "in", "to", "a", "an", "and", "for", "of", "with", "by", "as", "it", "that", "this", "be", "are", "or", "not", "if", "then", "there", "such", "can", "has", "have", "from", "but", "when", "how", "what", "why", "will", "would", "should", "could", "about", "into", "only", "than", "over", "also", "some", "any", "very", "much", "more", "most"]);

dictionaryData.forEach(item => translationCache.set(item.term.toLowerCase(), item.def));

let baseQuestions = [];
let currentQuestions = [];
let currentPackId = null;
let activePack = null;
let currentQuestionIndex = 0;
let userAnswers = {};
let score = 0;
let studyMode = "practice";
let isWrongPractice = false;
let quizFinished = false;
let sessionRecorded = false;
let sessionStarted = false;
let sessionStartedAt = null;
let timerInterval = null;
let elapsedSeconds = 0;
let remainingSeconds = 0;

const packListEl = document.getElementById("pack-list");
const quizContainer = document.getElementById("quiz-container");
const emptyState = document.getElementById("empty-state");
const quizTitle = document.getElementById("quiz-title");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const explanationContainer = document.getElementById("explanation-card");
const explanationText = document.getElementById("explanation-text");
const explanationTranslated = document.getElementById("explanation-translated");
const resultCard = document.getElementById("result-card");
const sessionGate = document.getElementById("session-gate");
const sessionStatus = document.getElementById("session-status");
const startHint = document.getElementById("start-hint");
const btnStart = document.getElementById("btn-start");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnFinish = document.getElementById("btn-finish");
const questionCounter = document.getElementById("question-counter");
const scoreDisplay = document.getElementById("score-display");
const timerDisplay = document.getElementById("timer-display");
const progressBar = document.getElementById("overall-progress-bar");
const progressText = document.getElementById("progress-text");
const modePracticeBtn = document.getElementById("mode-practice");
const modeTestBtn = document.getElementById("mode-test");
const timeLimitEl = document.getElementById("time-limit");
const btnPracticeWrong = document.getElementById("btn-practice-wrong");
const statSessions = document.getElementById("stat-sessions");
const statAccuracy = document.getElementById("stat-accuracy");
const statBest = document.getElementById("stat-best");
const statWrong = document.getElementById("stat-wrong");
const statAccuracyLabel = document.getElementById("stat-accuracy-label");
const statBestLabel = document.getElementById("stat-best-label");
const statWrongLabel = document.getElementById("stat-wrong-label");
const statAccuracyBar = document.getElementById("stat-accuracy-bar");
const statBestBar = document.getElementById("stat-best-bar");
const statWrongBar = document.getElementById("stat-wrong-bar");
const dictListEl = document.getElementById("dict-list");
const dictSearchEl = document.getElementById("dict-search");
const metricPackCount = document.getElementById("metric-pack-count");
const metricQuestionCount = document.getElementById("metric-question-count");
const metricActiveMode = document.getElementById("metric-active-mode");

function init() {
    renderPacks();
    renderDictionary(dictionaryData);
    updateStatsDisplay();
    updateModeUI();
    updateTimerDisplay(0);
    updateHeaderMetrics();

    dictSearchEl.addEventListener("input", handleDictionarySearch);
    btnNext.addEventListener("click", handleNext);
    btnPrev.addEventListener("click", handlePrev);
    btnStart.addEventListener("click", startQuizSession);
    btnFinish.addEventListener("click", () => finishQuiz(false));
    modePracticeBtn.addEventListener("click", () => setStudyMode("practice"));
    modeTestBtn.addEventListener("click", () => setStudyMode("test"));
    btnPracticeWrong.addEventListener("click", startWrongPractice);
}

function updateHeaderMetrics() {
    metricPackCount.textContent = String(availablePacks.length);
    metricQuestionCount.textContent = String(availablePacks.reduce((sum, pack) => sum + pack.count, 0));
    metricActiveMode.textContent = studyMode === "practice" ? "Luyện tập" : "Kiểm tra";
}

function setStudyMode(mode) {
    studyMode = mode;
    updateModeUI();
    updateHeaderMetrics();
    if (activePack) {
        startSession(baseQuestions, false);
    }
}

function updateModeUI() {
    modePracticeBtn.classList.toggle("active", studyMode === "practice");
    modeTestBtn.classList.toggle("active", studyMode === "test");
    timeLimitEl.disabled = studyMode !== "test";
}

function renderPacks() {
    packListEl.innerHTML = "";
    availablePacks.forEach(pack => {
        const item = document.createElement("button");
        item.className = `pack-item ${currentPackId === pack.id && !isWrongPractice ? "active" : ""}`;
        item.type = "button";
        item.innerHTML = `
            <h3>${pack.title}</h3>
            <p>${pack.desc}</p>
            <div class="pack-meta">
                <span class="topic-badge">${pack.count} câu</span>
                <span class="topic-badge">${packLabel(pack.accent)}</span>
            </div>
        `;
        item.addEventListener("click", () => loadPack(pack));
        packListEl.appendChild(item);
    });
}

function packLabel(accent) {
    const labels = {
        blue: "Nền tảng",
        teal: "Cấu trúc",
        amber: "Vận dụng",
        violet: "Thuật toán"
    };
    return labels[accent] || "Chủ đề";
}

async function loadPack(pack) {
    try {
        const response = await fetch(pack.file);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        activePack = pack;
        currentPackId = pack.id;
        baseQuestions = data.map((question, index) => ({ ...question, __originalIndex: index }));

        startSession(baseQuestions, false);
        renderPacks();
        updateStatsDisplay(pack.id);
    } catch (error) {
        console.error("Lỗi khi tải bộ câu hỏi:", error);
        alert("Không thể tải bộ câu hỏi này. Nếu bạn đang mở file trực tiếp, hãy chạy bằng local server.");
    }
}

function startSession(questions, wrongPractice) {
    stopTimer();
    isWrongPractice = wrongPractice;
    currentQuestions = questions;
    currentQuestionIndex = 0;
    userAnswers = {};
    score = 0;
    quizFinished = false;
    sessionRecorded = false;
    sessionStarted = false;
    sessionStartedAt = null;
    elapsedSeconds = 0;
    remainingSeconds = studyMode === "test" ? Number(timeLimitEl.value) : 0;
    resultCard.style.display = "none";

    if (studyMode === "practice" && !wrongPractice) {
        loadProgress(currentPackId);
    }

    quizTitle.textContent = `${activePack.title}${wrongPractice ? " - Luyện câu sai" : ""}`;
    emptyState.style.display = "none";
    quizContainer.style.display = "flex";
    updateTimerDisplay(studyMode === "test" ? remainingSeconds : 0);
    updateOverallProgress();
    showQuestion();
}

function startQuizSession() {
    if (sessionStarted || quizFinished || currentQuestions.length === 0) return;

    sessionStarted = true;
    sessionStartedAt = Date.now();
    elapsedSeconds = 0;
    if (studyMode === "test") {
        remainingSeconds = Number(timeLimitEl.value);
    }
    startTimer();
    showQuestion();
}

function startWrongPractice() {
    if (!activePack || baseQuestions.length === 0) return;
    const packStats = getPackStats(currentPackId);
    const wrongIds = new Set(packStats.wrongQuestionIds || []);
    const wrongQuestions = baseQuestions.filter(question => wrongIds.has(question.__originalIndex));

    if (wrongQuestions.length === 0) {
        alert("Chưa có câu sai để luyện lại trong gói này.");
        return;
    }

    studyMode = "practice";
    updateModeUI();
    updateHeaderMetrics();
    startSession(wrongQuestions, true);
}

function loadProgress(packId) {
    const saved = localStorage.getItem(`quiz_progress_${packId}`);
    if (!saved) return;

    try {
        const parsed = JSON.parse(saved);
        userAnswers = parsed.answers || {};
        currentQuestionIndex = Math.min(parsed.currentIndex || 0, currentQuestions.length - 1);
        calculateScore();
    } catch {
        userAnswers = {};
        currentQuestionIndex = 0;
        score = 0;
    }
}

function saveProgress() {
    if (!currentPackId || studyMode !== "practice" || isWrongPractice) return;
    localStorage.setItem(`quiz_progress_${currentPackId}`, JSON.stringify({
        answers: userAnswers,
        currentIndex: currentQuestionIndex
    }));
}

function calculateScore() {
    score = currentQuestions.reduce((total, question, index) => {
        return total + (isAnswerCorrect(question, userAnswers[index]) ? 1 : 0);
    }, 0);
}

function isAnswerCorrect(question, selectedIndex) {
    if (selectedIndex === undefined) return false;
    const correctLetter = question.answer.trim();
    const selectedText = question.options[selectedIndex];
    return Boolean(selectedText && selectedText.startsWith(correctLetter));
}

function updateOverallProgress() {
    const total = currentQuestions.length;
    const answered = Object.keys(userAnswers).length;
    const percentage = total > 0 ? (answered / total) * 100 : 0;

    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${answered} / ${total} câu`;
}

function showQuestion() {
    if (currentQuestions.length === 0) return;

    calculateScore();
    const question = currentQuestions[currentQuestionIndex];
    const hasAnswered = userAnswers[currentQuestionIndex] !== undefined;
    const showAnswers = studyMode === "practice" || quizFinished;
    const canInteract = sessionStarted && !quizFinished;

    questionCounter.textContent = `Câu ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    scoreDisplay.textContent = showAnswers
        ? `Đúng: ${score}`
        : `Đã trả lời: ${Object.keys(userAnswers).length}`;
    questionText.textContent = question.question;
    optionsContainer.innerHTML = "";
    explanationContainer.style.display = "none";
    explanationContainer.className = "explanation-card";
    explanationTranslated.textContent = "";

    question.options.forEach((optText, idx) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.type = "button";
        btn.textContent = optText;

        const isSelectedOption = userAnswers[currentQuestionIndex] === idx;
        const isCorrectOption = optText.startsWith(question.answer.trim());

        if (!canInteract && !quizFinished) {
            btn.disabled = true;
        } else if (showAnswers && hasAnswered) {
            btn.disabled = true;
            if (isCorrectOption) {
                btn.classList.add("correct");
            } else if (isSelectedOption) {
                btn.classList.add("wrong");
            }
        } else if (quizFinished) {
            btn.disabled = true;
            if (isCorrectOption) btn.classList.add("correct");
        } else {
            if (isSelectedOption) btn.classList.add("selected");
            btn.addEventListener("click", () => handleOptionSelect(idx));
        }

        optionsContainer.appendChild(btn);
    });

    if (showAnswers && hasAnswered) {
        showFeedback(question, userAnswers[currentQuestionIndex]);
    }

    sessionGate.classList.toggle("running", sessionStarted && !quizFinished);
    sessionStatus.textContent = quizFinished
        ? "Đã hoàn thành"
        : sessionStarted
            ? "Đang làm bài"
            : "Sẵn sàng";
    startHint.textContent = quizFinished
        ? "Xem lại đáp án hoặc chọn gói khác để bắt đầu phiên mới."
        : sessionStarted
            ? "Thời gian đang được tính cho phiên hiện tại."
            : "Bấm Bắt đầu để mở câu hỏi và tính thời gian.";
    btnStart.style.display = sessionStarted || quizFinished ? "none" : "inline-flex";

    btnPrev.disabled = quizFinished
        ? currentQuestionIndex === 0
        : !canInteract || currentQuestionIndex === 0;
    btnNext.textContent = currentQuestionIndex === currentQuestions.length - 1 ? "Kết thúc" : "Câu tiếp theo";
    btnFinish.style.display = studyMode === "test" && !quizFinished ? "inline-flex" : "none";
    btnFinish.disabled = !canInteract;
    btnNext.disabled = quizFinished
        ? currentQuestionIndex === currentQuestions.length - 1
        : !canInteract;

    updateDictionaryForCurrentQuestion(question);
}

function handleOptionSelect(optionIdx) {
    if (!sessionStarted || quizFinished) return;
    userAnswers[currentQuestionIndex] = optionIdx;
    calculateScore();
    saveProgress();
    updateOverallProgress();
    showQuestion();
}

function showFeedback(question, selectedIdx) {
    const isCorrect = isAnswerCorrect(question, selectedIdx);
    explanationContainer.style.display = "block";
    explanationContainer.classList.add(isCorrect ? "correct" : "wrong");
    explanationText.innerHTML = `<strong>${isCorrect ? "Chính xác!" : "Chưa chính xác."}</strong><br>${question.explanation || "Không có giải thích chi tiết cho câu này."}`;

    if (question.explanation) {
        translateExplanation(question.explanation);
    }
}

function handleNext() {
    if (!sessionStarted) return;
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        if (!quizFinished) saveProgress();
        showQuestion();
        return;
    }

    if (!quizFinished) {
        finishQuiz(false);
    }
}

function handlePrev() {
    if (!sessionStarted) return;
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        if (!quizFinished) saveProgress();
        showQuestion();
    }
}

function finishQuiz(autoSubmitted) {
    if (!sessionStarted) return;
    if (quizFinished && sessionRecorded) return;

    quizFinished = true;
    stopTimer();
    calculateScore();
    recordSession();
    updateOverallProgress();
    updateStatsDisplay(currentPackId);
    showResult(autoSubmitted);
    showQuestion();
}

function showResult(autoSubmitted) {
    const total = currentQuestions.length;
    const answered = Object.keys(userAnswers).length;
    const wrong = total - score;
    const percent = total ? Math.round((score / total) * 100) : 0;
    const duration = formatTime(getSessionDuration());

    resultCard.style.display = "block";
    resultCard.innerHTML = `
        <h2>${autoSubmitted ? "Hết giờ" : "Kết quả phiên học"}</h2>
        <p>${getResultMessage(percent)}</p>
        <div class="result-grid">
            <div class="result-stat"><strong>${score}/${total}</strong><span>Điểm</span></div>
            <div class="result-stat"><strong>${percent}%</strong><span>Chính xác</span></div>
            <div class="result-stat"><strong>${answered}</strong><span>Đã trả lời</span></div>
            <div class="result-stat"><strong>${wrong}</strong><span>Cần ôn lại</span></div>
        </div>
        <p style="margin-top: 14px; color: var(--text-secondary);">Thời gian làm bài: ${duration}</p>
    `;
}

function getResultMessage(percent) {
    if (percent >= 85) return "Bạn đang nắm khá chắc chủ đề này. Tiếp tục luyện các câu sai để giữ phong độ.";
    if (percent >= 60) return "Kết quả ổn, nhưng vẫn còn một số phần nên ôn lại.";
    return "Nên quay lại phần lý thuyết và luyện lại các câu sai trong gói này.";
}

function recordSession() {
    if (sessionRecorded || !currentPackId) return;
    sessionRecorded = true;

    const stats = readStats();
    const packStats = stats.packs[currentPackId] || createEmptyPackStats();
    const total = currentQuestions.length;
    const wrongSet = new Set(packStats.wrongQuestionIds || []);

    currentQuestions.forEach((question, index) => {
        const originalIndex = question.__originalIndex;
        if (isAnswerCorrect(question, userAnswers[index])) {
            wrongSet.delete(originalIndex);
        } else {
            wrongSet.add(originalIndex);
        }
    });

    packStats.sessions += 1;
    packStats.totalQuestions += total;
    packStats.totalCorrect += score;
    packStats.totalTime += getSessionDuration();
    packStats.lastScore = total ? Math.round((score / total) * 100) : 0;
    packStats.bestScore = Math.max(packStats.bestScore, packStats.lastScore);
    packStats.wrongQuestionIds = [...wrongSet].sort((a, b) => a - b);

    stats.totalSessions += 1;
    stats.totalQuestions += total;
    stats.totalCorrect += score;
    stats.totalTime += getSessionDuration();
    stats.packs[currentPackId] = packStats;

    localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
    btnPracticeWrong.disabled = packStats.wrongQuestionIds.length === 0;
}

function createEmptyPackStats() {
    return {
        sessions: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalTime: 0,
        lastScore: 0,
        bestScore: 0,
        wrongQuestionIds: []
    };
}

function readStats() {
    const fallback = {
        totalSessions: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalTime: 0,
        packs: {}
    };

    try {
        return JSON.parse(localStorage.getItem(STORAGE_STATS_KEY)) || fallback;
    } catch {
        return fallback;
    }
}

function getPackStats(packId) {
    const stats = readStats();
    return stats.packs[packId] || createEmptyPackStats();
}

function updateStatsDisplay(packId = currentPackId) {
    const stats = readStats();
    const packStats = packId ? getPackStats(packId) : null;
    const source = packStats || stats;
    const totalQuestions = source.totalQuestions || 0;
    const totalCorrect = source.totalCorrect || 0;
    const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    statSessions.textContent = String(source.sessions ?? stats.totalSessions);
    statAccuracy.textContent = `${accuracy}%`;
    statBest.textContent = `${packStats ? packStats.bestScore : 0}%`;
    statWrong.textContent = String(packStats ? packStats.wrongQuestionIds.length : 0);

    const bestScore = packStats ? packStats.bestScore : 0;
    const wrongTotal = packStats ? packStats.wrongQuestionIds.length : 0;
    const wrongBase = packStats && baseQuestions.length > 0 ? baseQuestions.length : totalQuestions;
    const wrongPercent = wrongBase ? Math.round((wrongTotal / wrongBase) * 100) : 0;

    statAccuracyLabel.textContent = `${accuracy}%`;
    statBestLabel.textContent = `${bestScore}%`;
    statWrongLabel.textContent = `${wrongPercent}%`;
    statAccuracyBar.style.width = `${accuracy}%`;
    statBestBar.style.width = `${bestScore}%`;
    statWrongBar.style.width = `${Math.min(wrongPercent, 100)}%`;
    btnPracticeWrong.disabled = !packStats || packStats.wrongQuestionIds.length === 0;
}

function startTimer() {
    if (studyMode === "test") {
        remainingSeconds = Number(timeLimitEl.value);
        updateTimerDisplay(remainingSeconds);
    } else {
        elapsedSeconds = 0;
        updateTimerDisplay(0);
    }

    timerInterval = setInterval(() => {
        if (studyMode === "test") {
            remainingSeconds -= 1;
            updateTimerDisplay(remainingSeconds);
            if (remainingSeconds <= 0) {
                finishQuiz(true);
            }
        } else {
            elapsedSeconds += 1;
            updateTimerDisplay(elapsedSeconds);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay(seconds) {
    timerDisplay.textContent = formatTime(Math.max(seconds, 0));
    timerDisplay.classList.toggle("warning", studyMode === "test" && seconds <= 60);
}

function getSessionDuration() {
    if (!sessionStartedAt) return 0;
    return Math.max(0, Math.round((Date.now() - sessionStartedAt) / 1000));
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function handleDictionarySearch(e) {
    const query = e.target.value.toLowerCase();

    if (query === "") {
        if (currentQuestions.length > 0) {
            updateDictionaryForCurrentQuestion(currentQuestions[currentQuestionIndex]);
        } else {
            renderDictionary(dictionaryData);
        }
        return;
    }

    const filtered = dictionaryData.filter(item =>
        item.term.toLowerCase().includes(query) ||
        item.def.toLowerCase().includes(query)
    );
    renderDictionary(filtered);
}

function renderDictionary(data) {
    dictListEl.innerHTML = "";
    if (data.length === 0) {
        const empty = document.createElement("p");
        empty.style.color = "var(--text-secondary)";
        empty.style.textAlign = "center";
        empty.style.padding = "20px";
        empty.textContent = "Không tìm thấy từ vựng.";
        dictListEl.appendChild(empty);
        return;
    }

    data.forEach(item => {
        dictListEl.appendChild(createDictionaryItem(item));
    });
}

function createDictionaryItem(item, highlighted = false) {
    const el = document.createElement("div");
    el.className = "dict-item";
    if (highlighted) {
        el.style.borderLeft = "3px solid var(--accent-primary)";
        el.style.backgroundColor = "#eff6ff";
    }

    const term = document.createElement("div");
    term.className = "dict-term";
    term.textContent = item.term;

    const def = document.createElement("div");
    def.className = "dict-def";
    def.textContent = item.def;

    el.append(term, def);
    return el;
}

function showLoadingIndicator() {
    if (document.getElementById("dict-loader")) return;

    const div = document.createElement("div");
    div.id = "dict-loader";
    div.className = "dict-context-title";
    div.textContent = "Đang dịch thêm từ mới...";
    dictListEl.prepend(div);
}

async function updateDictionaryForCurrentQuestion(question) {
    if (dictSearchEl.value.trim() !== "") return;

    const fullText = `${question.question} ${question.options.join(" ")} ${question.explanation || ""}`.toLowerCase();
    const words = fullText.replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));
    const uniqueWords = [...new Set(words)];
    const knownTerms = [];
    const unknownWords = [];

    dictionaryData.forEach(item => {
        if (item.term.includes(" ") && fullText.includes(item.term.toLowerCase())) {
            knownTerms.push(item);
        }
    });

    uniqueWords.forEach(word => {
        if (translationCache.has(word)) {
            if (!knownTerms.find(item => item.term.toLowerCase() === word) && translationCache.get(word) !== "Không rõ") {
                knownTerms.push({ term: word.charAt(0).toUpperCase() + word.slice(1), def: translationCache.get(word) });
            }
        } else {
            unknownWords.push(word);
        }
    });

    if (knownTerms.length > 0) {
        renderDictionaryWithHighlight(knownTerms, dictionaryData);
    } else {
        renderDictionary(dictionaryData);
    }

    const wordsToFetch = unknownWords.slice(0, 3);
    if (wordsToFetch.length === 0) return;

    showLoadingIndicator();
    await Promise.all(wordsToFetch.map(fetchWordTranslation));

    if (dictSearchEl.value.trim() === "") {
        renderDictionaryWithHighlight(knownTerms, dictionaryData);
    }
}

async function fetchWordTranslation(word) {
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`);
        const data = await res.json();
        const translated = data?.responseData?.translatedText;

        if (translated && translated.toLowerCase() !== word.toLowerCase()) {
            translationCache.set(word, translated);
            dictionaryData.push({ term: word.charAt(0).toUpperCase() + word.slice(1), def: translated });
        } else {
            translationCache.set(word, "Không rõ");
        }
    } catch (error) {
        console.error("Lỗi khi gọi API dịch thuật:", error);
    }
}

function renderDictionaryWithHighlight(relevantTerms, allTerms) {
    dictListEl.innerHTML = "";

    const headerEl = document.createElement("div");
    headerEl.className = "dict-context-title";
    headerEl.textContent = "Từ vựng trong câu này";
    dictListEl.appendChild(headerEl);

    relevantTerms.forEach(item => {
        dictListEl.appendChild(createDictionaryItem(item, true));
    });

    const divider = document.createElement("div");
    divider.className = "dict-divider";
    dictListEl.appendChild(divider);

    const relevantKeys = new Set(relevantTerms.map(item => item.term.toLowerCase()));
    allTerms
        .filter(item => !relevantKeys.has(item.term.toLowerCase()))
        .forEach(item => {
            dictListEl.appendChild(createDictionaryItem(item));
        });
}

async function translateExplanation(text) {
    if (sentenceCache.has(text)) {
        explanationTranslated.textContent = sentenceCache.get(text);
        return;
    }

    explanationTranslated.textContent = "Đang dịch giải thích...";

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`);
        const data = await response.json();
        const translated = data?.responseData?.translatedText;

        if (translated) {
            sentenceCache.set(text, translated);
            explanationTranslated.textContent = translated;
        } else {
            explanationTranslated.textContent = "";
        }
    } catch (error) {
        console.error("Lỗi dịch giải thích:", error);
        explanationTranslated.textContent = "(Không thể tải bản dịch giải thích)";
    }
}

document.addEventListener("DOMContentLoaded", init);
