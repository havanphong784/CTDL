// Safe fallback if Motion library fails to load (e.g., offline or CDN error)
const motionLib = window.Motion || {
    animate: (selector, keyframes, options) => {
        return { finished: Promise.resolve(), stop: () => {} };
    },
    spring: () => "ease-out",
    stagger: () => 0
};
const { animate, spring, stagger } = motionLib;

const glossary = [
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
    { term: "Node", def: "Nút / đỉnh" },
    { term: "Edge", def: "Cạnh" },
    { term: "Sorting", def: "Sắp xếp" },
    { term: "Searching", def: "Tìm kiếm" },
    { term: "Recursion", def: "Đệ quy" },
    { term: "Dynamic Programming", def: "Quy hoạch động" },
    { term: "Greedy Algorithm", def: "Thuật toán tham lam" },
    { term: "Divide and Conquer", def: "Chia để trị" },
    { term: "Hash Table", def: "Bảng băm" },
    { term: "Binary Search", def: "Tìm kiếm nhị phân" },
    { term: "Upper Bound", def: "Cận trên" },
    { term: "Lower Bound", def: "Cận dưới" },
    { term: "Tight Bound", def: "Cận chặt" },
    { term: "Constant Time", def: "Thời gian hằng số" },
    { term: "Linear Time", def: "Thời gian tuyến tính" },
    { term: "Quadratic Time", def: "Thời gian bậc hai" },
    { term: "Asymptotic Notation", def: "Ký pháp tiệm cận" }
];

const builtInPacks = [
    {
        id: "algo_analysis",
        title: "Phân tích thuật toán",
        desc: "Độ phức tạp, Big O, Omega, Theta và tốc độ tăng trưởng.",
        file: "./src/data/Algorithm_Analysis.json",
        source: "Có sẵn"
    },
    {
        id: "linked_lists",
        title: "Danh sách liên kết",
        desc: "Singly, doubly, circular linked lists và các thao tác cơ bản.",
        file: "./src/data/Linked_Lists.json",
        source: "Có sẵn"
    },
    {
        id: "stacks_queues",
        title: "Ngăn xếp & hàng đợi",
        desc: "LIFO, FIFO, cài đặt bằng mảng và danh sách liên kết.",
        file: "./src/data/Stacks-Queues.json",
        source: "Có sẵn"
    },
    {
        id: "search_sort",
        title: "Tìm kiếm & sắp xếp",
        desc: "Sequential search, binary search và các thuật toán sort nền tảng.",
        file: "./src/data/Searching_Sorting.json",
        source: "Có sẵn"
    },
    {
        id: "trees",
        title: "Cây",
        desc: "Binary tree, binary search tree, forest và duyệt cây.",
        file: "./src/data/Trees.json",
        source: "Có sẵn"
    },
    {
        id: "heaps",
        title: "Heap",
        desc: "Max heap, min heap, priority queue và heap sort.",
        file: "./src/data/Heaps.json",
        source: "Có sẵn"
    },
    {
        id: "graphs",
        title: "Đồ thị",
        desc: "Biểu diễn đồ thị, BFS, DFS và thuật ngữ liên quan.",
        file: "./src/data/Graphs.json",
        source: "Có sẵn"
    },
    {
        id: "hash_table",
        title: "Bảng băm",
        desc: "Hashing tĩnh, hashing động và xử lý xung đột.",
        file: "./src/data/Hash_Table.json",
        source: "Có sẵn"
    }
];

const STORAGE_STATS_KEY = "ctdlgt_quiz_stats_v2";
const STORAGE_PROGRESS_PREFIX = "ctdlgt_progress_";
const STORAGE_IMPORTED_KEY = "ctdlgt_imported_packs_v1";
const translationCache = new Map();
const sentenceCache = new Map();
const stopWords = new Set([
    "the", "is", "at", "which", "on", "in", "to", "a", "an", "and", "for", "of", "with", "by", "as",
    "it", "that", "this", "be", "are", "or", "not", "if", "then", "there", "such", "can", "has",
    "have", "from", "but", "when", "how", "what", "why", "will", "would", "should", "could", "about",
    "into", "only", "than", "over", "also", "some", "any", "very", "much", "more", "most"
]);

glossary.forEach(item => translationCache.set(item.term.toLowerCase(), item.def));

let importedPacks = [];
let availablePacks = [];
let selectedPack = null;
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

const els = {
    setupView: document.getElementById("setup-view"),
    quizView: document.getElementById("quiz-view"),
    selectedPackSummary: document.getElementById("selected-pack-summary"),
    packList: document.getElementById("pack-list"),
    packCount: document.getElementById("pack-count"),
    packSearch: document.getElementById("pack-search"),
    quizContainer: document.getElementById("quiz-container"),
    emptyState: document.getElementById("empty-state"),
    activePackLabel: document.getElementById("active-pack-label"),
    quizTitle: document.getElementById("quiz-title"),
    questionText: document.getElementById("question-text"),
    questionTranslation: document.getElementById("question-translation"),
    btnTranslateQuestion: document.getElementById("btn-translate-question"),
    btnTranslateExplanation: document.getElementById("btn-translate-explanation"),
    optionsContainer: document.getElementById("options-container"),
    explanationCard: document.getElementById("explanation-card"),
    explanationText: document.getElementById("explanation-text"),
    explanationTranslated: document.getElementById("explanation-translated"),
    resultCard: document.getElementById("result-card"),
    sessionGate: document.getElementById("session-gate"),
    sessionStatus: document.getElementById("session-status"),
    startHint: document.getElementById("start-hint"),
    btnStart: document.getElementById("btn-start"),
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    btnFinish: document.getElementById("btn-finish"),
    btnBackSetup: document.getElementById("btn-back-setup"),
    btnResetSession: document.getElementById("btn-reset-session"),
    btnOpenQuiz: document.getElementById("btn-open-quiz"),
    questionCounter: document.getElementById("question-counter"),
    scoreDisplay: document.getElementById("score-display"),
    timerDisplay: document.getElementById("timer-display"),
    progressBar: document.getElementById("overall-progress-bar"),
    progressText: document.getElementById("progress-text"),
    modePractice: document.getElementById("mode-practice"),
    modeTest: document.getElementById("mode-test"),
    timeLimit: document.getElementById("time-limit"),
    btnPracticeWrong: document.getElementById("btn-practice-wrong"),
    importFile: document.getElementById("import-file"),
    importStatus: document.getElementById("import-status"),
    btnImportSample: document.getElementById("btn-import-sample"),
    sampleDialog: document.getElementById("sample-dialog"),
    btnCloseSample: document.getElementById("btn-close-sample"),
    metricSessions: document.getElementById("metric-sessions"),
    metricAccuracy: document.getElementById("metric-accuracy"),
    metricBest: document.getElementById("metric-best"),
    metricWrong: document.getElementById("metric-wrong"),
    statAccuracyLabel: document.getElementById("stat-accuracy-label"),
    statBestLabel: document.getElementById("stat-best-label"),
    statWrongLabel: document.getElementById("stat-wrong-label"),
    statAccuracyBar: document.getElementById("stat-accuracy-bar"),
    statBestBar: document.getElementById("stat-best-bar"),
    statWrongBar: document.getElementById("stat-wrong-bar"),
    dictList: document.getElementById("dict-list"),
    dictSearch: document.getElementById("dict-search"),
    importFileSidebar: document.getElementById("import-file-sidebar"),
    importDropzone: document.getElementById("import-dropzone")
};

function init() {
    importedPacks = readImportedPacks();
    rebuildPackList();
    renderDictionary(glossary);
    updateStatsDisplay();
    updateModeUI();
    updateTimerDisplay(0);
    bindEvents();
    showSetupView();
}

function bindEvents() {
    els.packSearch.addEventListener("input", renderPacks);
    els.dictSearch.addEventListener("input", handleDictionarySearch);
    els.btnNext.addEventListener("click", handleNext);
    els.btnPrev.addEventListener("click", handlePrev);
    els.btnStart.addEventListener("click", startQuizSession);
    els.btnFinish.addEventListener("click", () => finishQuiz(false));
    els.btnBackSetup.addEventListener("click", showSetupView);
    els.btnResetSession.addEventListener("click", resetActiveSession);
    els.btnOpenQuiz.addEventListener("click", () => openQuizFromSelection(false));
    els.modePractice.addEventListener("click", () => setStudyMode("practice"));
    els.modeTest.addEventListener("click", () => setStudyMode("test"));
    els.btnPracticeWrong.addEventListener("click", startWrongPractice);
    els.btnTranslateQuestion.addEventListener("click", translateCurrentQuestion);
    els.btnTranslateExplanation.addEventListener("click", translateCurrentExplanation);
    els.importFile.addEventListener("change", handleImportFile);
    if (els.importFileSidebar) {
        els.importFileSidebar.addEventListener("change", handleImportFile);
    }
    
    // Setup Drag & Drop
    const dropzone = els.importDropzone;
    if (dropzone) {
        ["dragenter", "dragover"].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add("dragover");
            }, false);
        });

        ["dragleave", "drop"].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove("dragover");
            }, false);
        });

        dropzone.addEventListener("drop", (e) => {
            const dt = e.dataTransfer;
            const file = dt.files?.[0];
            if (file) {
                handleImportFile(file);
            }
        }, false);
    }
    els.btnImportSample.addEventListener("click", showSampleDialog);
    els.btnCloseSample.addEventListener("click", () => els.sampleDialog.close());
}

function rebuildPackList() {
    availablePacks = [...builtInPacks, ...importedPacks];
    els.packCount.textContent = `${availablePacks.length} gói`;
    renderPacks();
}

function renderPacks() {
    const query = els.packSearch.value.trim().toLowerCase();
    const packs = availablePacks.filter(pack => {
        const haystack = `${pack.title} ${pack.desc} ${pack.source}`.toLowerCase();
        return haystack.includes(query);
    });

    els.packList.innerHTML = "";

    if (packs.length === 0) {
        els.packList.innerHTML = '<p class="muted-empty">Không tìm thấy gói phù hợp.</p>';
        return;
    }

    packs.forEach(pack => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = `pack-item ${selectedPack?.id === pack.id ? "active" : ""}`;
        item.innerHTML = `
            <div class="pack-topline">
                <h3>${escapeHtml(pack.title)}</h3>
                <span class="pack-source">${escapeHtml(pack.source || "Import")}</span>
            </div>
            <p>${escapeHtml(pack.desc || "Gói câu hỏi đã import.")}</p>
            <div class="pack-meta">
                <span>${pack.count ? `${pack.count} câu` : "Sẵn sàng tải"}</span>
                ${pack.imported ? '<span class="text-button" data-delete-pack>Gỡ</span>' : ""}
            </div>
        `;

        item.addEventListener("click", event => {
            if (event.target.closest("[data-delete-pack]")) {
                removeImportedPack(pack.id);
                return;
            }
            selectPack(pack);
        });

        els.packList.appendChild(item);
    });

    animate(
        ".pack-item",
        { opacity: [0, 1], y: [30, 0], scale: [0.85, 1], rotate: [-2, 0] },
        { delay: stagger(0.08), type: "spring", stiffness: 400, damping: 15 }
    );
}

function selectPack(pack) {
    selectedPack = pack;
    currentPackId = pack.id;
    renderPacks();
    updateSelectedPackSummary(pack);
    updateStatsDisplay(pack.id);
    els.btnOpenQuiz.disabled = false;
}

function updateSelectedPackSummary(pack) {
    const packStats = getPackStats(pack.id);
    const wrongCount = packStats.wrongQuestionIds.length;
    els.selectedPackSummary.innerHTML = `
        <span>Gói đang chọn</span>
        <strong>${escapeHtml(pack.title)}</strong>
        <small>${escapeHtml(pack.desc || "Gói câu hỏi đã import.")}</small>
        <small>${wrongCount > 0 ? `${wrongCount} câu sai có thể luyện lại` : "Chưa có câu sai trong gói này"}</small>
    `;

    animate(
        els.selectedPackSummary,
        { opacity: [0, 1], scale: [0.9, 1], rotate: [-1, 0] },
        { type: "spring", stiffness: 400, damping: 15 }
    );
}

async function openQuizFromSelection(wrongPractice) {
    if (!selectedPack) {
        setImportStatus("Chọn một gói câu hỏi trước khi vào quiz.", "error");
        return;
    }
    await loadPack(selectedPack, wrongPractice);
}

async function loadPack(pack, wrongPractice = false) {
    try {
        const data = pack.imported ? pack.questions : await fetchPackFile(pack.file);
        const questions = normalizeQuestions(data);

        activePack = { ...pack, count: questions.length };
        currentPackId = pack.id;
        baseQuestions = questions.map((question, index) => ({ ...question, __originalIndex: index }));

        let sessionQuestions = baseQuestions;
        if (wrongPractice) {
            const wrongIds = new Set(getPackStats(currentPackId).wrongQuestionIds || []);
            sessionQuestions = baseQuestions.filter(question => wrongIds.has(question.__originalIndex));
            if (sessionQuestions.length === 0) {
                setImportStatus("Gói này chưa có câu sai để luyện lại.", "success");
                return;
            }
            studyMode = "practice";
            updateModeUI();
        }

        startSession(sessionQuestions, wrongPractice);
        showQuizView();
        renderPacks();
        updateStatsDisplay(pack.id);
    } catch (error) {
        console.error("Không thể tải gói câu hỏi:", error);
        setImportStatus("Không thể tải gói câu hỏi. Kiểm tra lại file dữ liệu.", "error");
    }
}

async function fetchPackFile(file) {
    const response = await fetch(file);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

function normalizeQuestions(data) {
    let questionsArray = data;
    if (!Array.isArray(data) && data && typeof data === "object") {
        if (Array.isArray(data.questions)) {
            questionsArray = data.questions;
        } else if (Array.isArray(data.data)) {
            questionsArray = data.data;
        } else if (Array.isArray(data.quiz)) {
            questionsArray = data.quiz;
        }
    }

    if (!Array.isArray(questionsArray)) {
        throw new Error("Dữ liệu phải là một mảng câu hỏi hoặc chứa mảng câu hỏi (ví dụ: { questions: [...] }).");
    }

    const normalized = questionsArray.map((item, index) => {
        const question = String(item.question || item.title || item.text || "").trim();
        
        let options = [];
        if (Array.isArray(item.options)) {
            options = item.options.map(option => String(option).trim()).filter(Boolean);
        } else if (Array.isArray(item.answers)) {
            options = item.answers.map(option => String(option).trim()).filter(Boolean);
        } else if (Array.isArray(item.choices)) {
            options = item.choices.map(option => String(option).trim()).filter(Boolean);
        }

        let rawAnswer = item.answer !== undefined ? item.answer : (item.correctAnswer !== undefined ? item.correctAnswer : item.correct_answer);
        let answer = "";
        
        if (rawAnswer !== undefined && rawAnswer !== null) {
            let strAnswer = String(rawAnswer).trim();
            
            // Case 1: Answer is index-based (e.g. 0, 1, 2)
            if (/^\d+$/.test(strAnswer)) {
                const idx = parseInt(strAnswer, 10);
                if (idx >= 0 && idx < options.length) {
                    answer = String.fromCharCode(65 + idx);
                }
            }
            
            // Case 2: Answer starts with choice letter (e.g. "A.", "A)", "A ")
            if (!answer) {
                const matchLetter = strAnswer.match(/^([A-Z])([\.\)\s]|$)/i);
                if (matchLetter) {
                    answer = matchLetter[1].toUpperCase();
                }
            }
            
            // Case 3: Answer is option text string matching one of options
            if (!answer) {
                const matchIdx = options.findIndex(opt => {
                    const optStr = opt.toLowerCase();
                    const ansStr = strAnswer.toLowerCase();
                    if (optStr === ansStr) return true;
                    const parsed = parseOption(opt, 0);
                    return parsed.text.toLowerCase() === ansStr;
                });
                if (matchIdx !== -1) {
                    answer = String.fromCharCode(65 + matchIdx);
                }
            }
            
            // Default: Single letter matching A-Z
            if (!answer && /^[A-Za-z]$/.test(strAnswer)) {
                answer = strAnswer.toUpperCase();
            }
        }

        const explanation = String(item.explanation || item.explain || item.desc || "").trim();

        if (!question) {
            throw new Error(`Câu ${index + 1} bị thiếu nội dung câu hỏi (question).`);
        }
        if (options.length < 2) {
            throw new Error(`Câu ${index + 1} phải có ít nhất 2 phương án lựa chọn (options).`);
        }
        if (!answer || !/^[A-Z]$/.test(answer)) {
            throw new Error(`Câu ${index + 1} thiếu đáp án đúng hoặc đáp án không hợp lệ ("${rawAnswer}").`);
        }

        const answerIdx = answer.charCodeAt(0) - 65;
        if (answerIdx >= options.length) {
            throw new Error(`Câu ${index + 1} có đáp án "${answer}" vượt quá số lượng phương án (${options.length}).`);
        }

        return { question, options, answer, explanation };
    });

    if (normalized.length === 0) {
        throw new Error("File JSON không chứa câu hỏi nào.");
    }

    return normalized;
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
    remainingSeconds = studyMode === "test" ? Number(els.timeLimit.value) : 0;

    if (studyMode === "practice" && !wrongPractice) {
        loadProgress(currentPackId);
    }

    els.activePackLabel.textContent = wrongPractice ? "Luyện lại câu sai" : activePack.source || "Gói câu hỏi";
    els.quizTitle.textContent = `${activePack.title}${wrongPractice ? " - câu sai" : ""}`;
    els.emptyState.hidden = true;
    els.quizContainer.hidden = false;
    els.resultCard.hidden = true;
    els.btnResetSession.disabled = false;
    updateTimerDisplay(studyMode === "test" ? remainingSeconds : 0);
    updateOverallProgress();
    showQuestion();
}

function resetActiveSession() {
    if (!activePack || baseQuestions.length === 0) return;
    startSession(isWrongPractice ? currentQuestions : baseQuestions, isWrongPractice);
}

function startQuizSession() {
    if (sessionStarted || quizFinished || currentQuestions.length === 0) return;

    sessionStarted = true;
    sessionStartedAt = Date.now();
    elapsedSeconds = 0;
    remainingSeconds = studyMode === "test" ? Number(els.timeLimit.value) : 0;
    startTimer();
    showQuestion();
}

function setStudyMode(mode) {
    if (studyMode === mode) return;

    studyMode = mode;
    updateModeUI();

    if (!els.quizView.hidden && activePack && baseQuestions.length > 0) {
        startSession(baseQuestions, false);
    }
}

function updateModeUI() {
    els.modePractice.classList.toggle("active", studyMode === "practice");
    els.modeTest.classList.toggle("active", studyMode === "test");
    els.timeLimit.disabled = studyMode !== "test";
    els.btnFinish.hidden = studyMode !== "test";
}

function showSetupView() {
    stopTimer();
    els.setupView.hidden = false;
    els.quizView.hidden = true;
    els.btnBackSetup.hidden = true;
    els.btnResetSession.hidden = true;
    els.btnResetSession.disabled = !activePack;
    document.documentElement.scrollTop = 0;

    animate(
        els.setupView,
        { opacity: [0, 1] },
        { duration: 0.3, easing: "ease-out" }
    );
    
    animate(".setup-hero", { opacity: [0, 1], scale: [0.95, 1], y: [20, 0] }, { duration: 0.5, type: "spring", stiffness: 300, damping: 20 });
    animate(".metric-card", { opacity: [0, 1], scale: [0.8, 1], y: [30, 0] }, { delay: stagger(0.08), type: "spring", stiffness: 400, damping: 18 });
    animate(".setup-panel", { opacity: [0, 1], x: [30, 0] }, { duration: 0.5, type: "spring", stiffness: 300, damping: 20 });
}

function showQuizView() {
    els.setupView.hidden = true;
    els.quizView.hidden = false;
    els.btnBackSetup.hidden = false;
    els.btnResetSession.hidden = false;
    els.btnResetSession.disabled = false;
    document.documentElement.scrollTop = 0;

    animate(
        els.quizView,
        { opacity: [0, 1] },
        { duration: 0.3, easing: "ease-out" }
    );
    
    animate(".quiz-stage", { opacity: [0, 1], scale: [0.98, 1], y: [20, 0] }, { duration: 0.4, type: "spring", stiffness: 300, damping: 20 });
    animate(".assist-panel", { opacity: [0, 1], x: [30, 0] }, { duration: 0.4, type: "spring", stiffness: 300, damping: 20 });
}

function startWrongPractice() {
    openQuizFromSelection(true);
}

function showQuestion() {
    if (currentQuestions.length === 0) return;

    calculateScore();
    const question = currentQuestions[currentQuestionIndex];
    const hasAnswered = userAnswers[currentQuestionIndex] !== undefined;
    const showAnswers = studyMode === "practice" || quizFinished;
    const canInteract = sessionStarted && !quizFinished;

    els.questionCounter.textContent = `${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    els.scoreDisplay.textContent = showAnswers ? `Đúng: ${score}` : `Đã trả lời: ${Object.keys(userAnswers).length}`;
    els.questionText.textContent = question.question;
    els.questionTranslation.textContent = "";
    els.optionsContainer.innerHTML = "";
    els.explanationCard.hidden = true;
    els.explanationCard.className = "explanation-card";
    els.explanationTranslated.textContent = "";

    question.options.forEach((option, index) => {
        const parsed = parseOption(option, index);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-btn";
        button.innerHTML = `
            <span class="option-key">${escapeHtml(parsed.key)}</span>
            <span class="option-text">${escapeHtml(parsed.text)}</span>
        `;

        const isSelected = userAnswers[currentQuestionIndex] === index;
        const isCorrect = getOptionLetter(option, index) === question.answer;

        if (!canInteract && !quizFinished) {
            button.disabled = true;
        } else if (showAnswers && hasAnswered) {
            button.disabled = true;
            if (isCorrect) button.classList.add("correct");
            if (isSelected && !isCorrect) button.classList.add("wrong");
        } else if (quizFinished) {
            button.disabled = true;
            if (isCorrect) button.classList.add("correct");
        } else {
            if (isSelected) button.classList.add("selected");
            button.addEventListener("click", () => handleOptionSelect(index));
        }

        els.optionsContainer.appendChild(button);
    });

    animate(
        ".option-btn",
        { opacity: [0, 1], x: [-30, 0], scale: [0.95, 1] },
        { delay: stagger(0.08), type: "spring", stiffness: 450, damping: 18 }
    );

    animate(
        els.questionText,
        { opacity: [0, 1], scale: [0.95, 1], y: [15, 0] },
        { duration: 0.4, type: "spring", stiffness: 300, damping: 15 }
    );
    
    if (!sessionStarted && !quizFinished) {
        animate(els.sessionGate, { opacity: [0, 1], scale: [0.9, 1], y: [20, 0] }, { type: "spring", stiffness: 400, damping: 15 });
    }

    if (showAnswers && hasAnswered) {
        showFeedback(question, userAnswers[currentQuestionIndex]);
    }

    updateSessionGate();
    updateNavigation(canInteract);
    updateDictionaryForCurrentQuestion(question);
}

function updateSessionGate() {
    els.sessionGate.classList.toggle("running", sessionStarted && !quizFinished);
    els.sessionStatus.textContent = quizFinished ? "Đã hoàn thành" : sessionStarted ? "Đang làm bài" : "Sẵn sàng";
    els.startHint.textContent = quizFinished
        ? "Xem lại đáp án, luyện câu sai hoặc chọn gói khác để bắt đầu phiên mới."
        : sessionStarted
            ? "Phiên đang chạy. Câu đã trả lời được tự lưu trong chế độ luyện tập."
            : "Bấm bắt đầu để mở câu hỏi và tính thời gian.";
    els.btnStart.hidden = sessionStarted || quizFinished;
}

function updateNavigation(canInteract) {
    els.btnPrev.disabled = quizFinished
        ? currentQuestionIndex === 0
        : !canInteract || currentQuestionIndex === 0;
    els.btnNext.textContent = currentQuestionIndex === currentQuestions.length - 1 ? "Kết thúc" : "Câu tiếp theo";
    els.btnNext.disabled = quizFinished
        ? currentQuestionIndex === currentQuestions.length - 1
        : !canInteract;
    els.btnFinish.hidden = studyMode !== "test" || quizFinished;
    els.btnFinish.disabled = !canInteract;
}

function handleOptionSelect(optionIndex) {
    if (!sessionStarted || quizFinished) return;

    userAnswers[currentQuestionIndex] = optionIndex;
    calculateScore();
    saveProgress();
    updateOverallProgress();
    showQuestion();
}

function handleNext() {
    if (!sessionStarted && !quizFinished) return;

    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex += 1;
        if (!quizFinished) saveProgress();
        showQuestion();
        return;
    }

    if (!quizFinished) {
        finishQuiz(false);
    }
}

function handlePrev() {
    if (!sessionStarted && !quizFinished) return;

    if (currentQuestionIndex > 0) {
        currentQuestionIndex -= 1;
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

function showFeedback(question, selectedIndex) {
    const correct = isAnswerCorrect(question, selectedIndex);
    els.explanationCard.hidden = false;
    els.explanationCard.classList.add(correct ? "correct" : "wrong");
    els.explanationText.innerHTML = `<strong>${correct ? "Chính xác." : "Chưa đúng."}</strong> ${escapeHtml(question.explanation || "Chưa có giải thích chi tiết cho câu này.")}`;
    els.btnTranslateExplanation.hidden = !question.explanation;
    els.explanationTranslated.textContent = "";

    animate(
        els.explanationCard,
        { opacity: [0, 1], y: [30, 0], scale: [0.8, 1], rotate: [-2, 0] },
        { type: "spring", stiffness: 450, damping: 15 }
    );
}

function showResult(autoSubmitted) {
    const total = currentQuestions.length;
    const answered = Object.keys(userAnswers).length;
    const wrong = total - score;
    const percent = total ? Math.round((score / total) * 100) : 0;
    const duration = formatTime(getSessionDuration());

    els.resultCard.hidden = false;
    els.resultCard.innerHTML = `
        <h2>${autoSubmitted ? "Hết giờ" : "Kết quả phiên học"}</h2>
        <p>${escapeHtml(getResultMessage(percent))}</p>
        <div class="result-grid">
            <div class="result-stat"><strong>${score}/${total}</strong><span>Điểm</span></div>
            <div class="result-stat"><strong>${percent}%</strong><span>Độ chính xác</span></div>
            <div class="result-stat"><strong>${answered}</strong><span>Đã trả lời</span></div>
            <div class="result-stat"><strong>${wrong}</strong><span>Cần ôn lại</span></div>
        </div>
        <p>Thời gian làm bài: ${duration}</p>
    `;

    animate(
        els.resultCard,
        { opacity: [0, 1], scale: [0.8, 1], y: [40, 0], rotate: [1, 0] },
        { type: "spring", stiffness: 300, damping: 15 }
    );

    animate(
        ".result-stat",
        { opacity: [0, 1], scale: [0.6, 1], rotate: [-3, 0] },
        { delay: stagger(0.1, { startDelay: 0.2 }), type: "spring", stiffness: 400, damping: 12 }
    );
}

function getResultMessage(percent) {
    if (percent >= 85) return "Bạn đang nắm chắc chủ đề này. Hãy luyện lại câu sai để giữ nhịp.";
    if (percent >= 60) return "Kết quả ổn. Nên xem lại các câu sai trước khi chuyển gói khác.";
    return "Nên ôn lại phần lý thuyết, sau đó dùng chế độ luyện câu sai để củng cố.";
}

function calculateScore() {
    score = currentQuestions.reduce((total, question, index) => {
        return total + (isAnswerCorrect(question, userAnswers[index]) ? 1 : 0);
    }, 0);
}

function isAnswerCorrect(question, selectedIndex) {
    if (selectedIndex === undefined) return false;
    const selectedOption = question.options[selectedIndex];
    return getOptionLetter(selectedOption, selectedIndex) === question.answer;
}

function getOptionLetter(option, index) {
    const match = String(option || "").trim().match(/^([A-Z])[\.\)]\s*/i);
    return match ? match[1].toUpperCase() : String.fromCharCode(65 + index);
}

function parseOption(option, index) {
    const raw = String(option || "").trim();
    const match = raw.match(/^([A-Z])[\.\)]\s*(.*)$/i);
    return match
        ? { key: match[1].toUpperCase(), text: match[2] || raw }
        : { key: String.fromCharCode(65 + index), text: raw };
}

function updateOverallProgress() {
    const total = currentQuestions.length;
    const answered = Object.keys(userAnswers).length;
    const percentage = total > 0 ? (answered / total) * 100 : 0;

    els.progressBar.style.width = `${percentage}%`;
    els.progressText.textContent = `${answered} / ${total} câu đã trả lời`;
}

function loadProgress(packId) {
    const saved = localStorage.getItem(`${STORAGE_PROGRESS_PREFIX}${packId}`);
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

    localStorage.setItem(`${STORAGE_PROGRESS_PREFIX}${currentPackId}`, JSON.stringify({
        answers: userAnswers,
        currentIndex: currentQuestionIndex
    }));
}

function recordSession() {
    if (sessionRecorded || !currentPackId) return;
    sessionRecorded = true;

    const stats = readStats();
    const packStats = stats.packs[currentPackId] || createEmptyPackStats();
    const wrongSet = new Set(packStats.wrongQuestionIds || []);
    const total = currentQuestions.length;

    currentQuestions.forEach((question, index) => {
        const originalIndex = question.__originalIndex;
        if (isAnswerCorrect(question, userAnswers[index])) {
            wrongSet.delete(originalIndex);
        } else {
            wrongSet.add(originalIndex);
        }
    });

    const duration = getSessionDuration();
    packStats.sessions += 1;
    packStats.totalQuestions += total;
    packStats.totalCorrect += score;
    packStats.totalTime += duration;
    packStats.lastScore = total ? Math.round((score / total) * 100) : 0;
    packStats.bestScore = Math.max(packStats.bestScore, packStats.lastScore);
    packStats.wrongQuestionIds = [...wrongSet].sort((a, b) => a - b);

    stats.totalSessions += 1;
    stats.totalQuestions += total;
    stats.totalCorrect += score;
    stats.totalTime += duration;
    stats.packs[currentPackId] = packStats;

    localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
    els.btnPracticeWrong.disabled = packStats.wrongQuestionIds.length === 0;
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
    const totalQuestions = stats.totalQuestions || 0;
    const totalCorrect = stats.totalCorrect || 0;
    const globalAccuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const packTotal = packStats?.totalQuestions || 0;
    const packAccuracy = packTotal ? Math.round((packStats.totalCorrect / packTotal) * 100) : 0;
    const bestScore = packStats ? packStats.bestScore : 0;
    const wrongTotal = packStats ? packStats.wrongQuestionIds.length : 0;
    const wrongBase = packStats && baseQuestions.length > 0 ? baseQuestions.length : packTotal;
    const wrongPercent = wrongBase ? Math.round((wrongTotal / wrongBase) * 100) : 0;

    els.metricSessions.textContent = String(stats.totalSessions || 0);
    els.metricAccuracy.textContent = `${globalAccuracy}%`;
    els.metricBest.textContent = `${bestScore}%`;
    els.metricWrong.textContent = String(wrongTotal);
    els.statAccuracyLabel.textContent = `${packAccuracy}%`;
    els.statBestLabel.textContent = `${bestScore}%`;
    els.statWrongLabel.textContent = `${wrongPercent}%`;
    els.statAccuracyBar.style.width = `${packAccuracy}%`;
    els.statBestBar.style.width = `${bestScore}%`;
    els.statWrongBar.style.width = `${Math.min(wrongPercent, 100)}%`;
    els.btnPracticeWrong.disabled = !packStats || wrongTotal === 0;
}

function startTimer() {
    stopTimer();

    if (studyMode === "test") {
        remainingSeconds = Number(els.timeLimit.value);
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
    els.timerDisplay.textContent = formatTime(Math.max(seconds, 0));
    els.timerDisplay.classList.toggle("warning", studyMode === "test" && seconds <= 60);
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

function handleDictionarySearch(event) {
    const query = event.target.value.trim().toLowerCase();

    if (!query) {
        if (currentQuestions.length > 0) {
            updateDictionaryForCurrentQuestion(currentQuestions[currentQuestionIndex]);
        } else {
            renderDictionary(glossary);
        }
        return;
    }

    const filtered = glossary.filter(item =>
        item.term.toLowerCase().includes(query) ||
        item.def.toLowerCase().includes(query)
    );
    renderDictionary(filtered);
}

function renderDictionary(items) {
    els.dictList.innerHTML = "";

    if (items.length === 0) {
        els.dictList.innerHTML = '<p class="muted-empty">Không tìm thấy từ vựng.</p>';
        return;
    }

    items.forEach(item => els.dictList.appendChild(createDictItem(item)));

    animate(
        ".dict-item",
        { opacity: [0, 1], x: [20, 0], scale: [0.9, 1] },
        { delay: stagger(0.04), type: "spring", stiffness: 400, damping: 20 }
    );
}

function createDictItem(item, relevant = false) {
    const el = document.createElement("div");
    el.className = `dict-item ${relevant ? "relevant" : ""}`;
    el.innerHTML = `
        <div class="dict-term">${escapeHtml(item.term)}</div>
        <div class="dict-def">${escapeHtml(item.def)}</div>
    `;
    return el;
}

function updateDictionaryForCurrentQuestion(question) {
    if (els.dictSearch.value.trim()) return;

    const fullText = `${question.question} ${question.options.join(" ")} ${question.explanation || ""}`.toLowerCase();
    const relevant = [];
    const knownKeys = new Set();

    glossary.forEach(item => {
        if (fullText.includes(item.term.toLowerCase())) {
            relevant.push(item);
            knownKeys.add(item.term.toLowerCase());
        }
    });

    const words = fullText
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

    [...new Set(words)].slice(0, 18).forEach(word => {
        if (knownKeys.has(word)) return;
        if (translationCache.has(word) && translationCache.get(word) !== "Không rõ") {
            relevant.push({ term: capitalize(word), def: translationCache.get(word) });
            knownKeys.add(word);
        }
    });

    renderDictionaryForQuestion(relevant);
}

function renderDictionaryForQuestion(relevantTerms) {
    els.dictList.innerHTML = "";

    if (relevantTerms.length > 0) {
        const title = document.createElement("div");
        title.className = "dict-section-title";
        title.textContent = "Từ vựng trong câu hiện tại";
        els.dictList.appendChild(title);
        relevantTerms.forEach(item => els.dictList.appendChild(createDictItem(item, true)));
    }

    const title = document.createElement("div");
    title.className = "dict-section-title";
    title.textContent = relevantTerms.length > 0 ? "Từ điển nhanh" : "Từ điển nhanh";
    els.dictList.appendChild(title);

    const relevantKeys = new Set(relevantTerms.map(item => item.term.toLowerCase()));
    glossary
        .filter(item => !relevantKeys.has(item.term.toLowerCase()))
        .slice(0, 12)
        .forEach(item => els.dictList.appendChild(createDictItem(item)));

    animate(
        ".dict-item",
        { opacity: [0, 1], x: [20, 0], scale: [0.9, 1] },
        { delay: stagger(0.04), type: "spring", stiffness: 400, damping: 20 }
    );
}

async function fetchWordTranslation(word) {
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`;
        const response = await fetch(url);
        const data = await response.json();
        const translated = data?.responseData?.translatedText;

        if (translated && translated.toLowerCase() !== word.toLowerCase()) {
            translationCache.set(word, translated);
            glossary.push({ term: capitalize(word), def: translated });
        } else {
            translationCache.set(word, "Không rõ");
        }
    } catch (error) {
        translationCache.set(word, "Không rõ");
    }
}

function translateCurrentQuestion() {
    if (!currentQuestions.length) return;
    translateText(currentQuestions[currentQuestionIndex].question, els.questionTranslation, "Đang dịch câu hỏi...");
}

function translateCurrentExplanation() {
    if (!currentQuestions.length) return;
    const explanation = currentQuestions[currentQuestionIndex].explanation;
    translateText(explanation, els.explanationTranslated, "Đang dịch giải thích...");
}

async function translateText(text, targetEl, loadingText) {
    if (!text) return;

    if (sentenceCache.has(text)) {
        targetEl.textContent = sentenceCache.get(text);
        return;
    }

    targetEl.textContent = loadingText;

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`;
        const response = await fetch(url);
        const data = await response.json();
        const translated = data?.responseData?.translatedText || "";

        sentenceCache.set(text, translated);
        targetEl.textContent = translated || "Không có bản dịch phù hợp.";
    } catch (error) {
        targetEl.textContent = "Không thể tải bản dịch lúc này.";
    }
}

async function handleImportFile(eventOrFile) {
    let file;
    if (eventOrFile instanceof File) {
        file = eventOrFile;
    } else {
        file = eventOrFile?.target?.files?.[0];
    }
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);
        const questions = normalizeQuestions(data);
        const title = cleanTitle(file.name.replace(/\.json$/i, ""));
        const id = `import_${Date.now()}`;
        const importedPack = {
            id,
            title,
            desc: `Gói import từ ${file.name}`,
            source: "Import",
            imported: true,
            count: questions.length,
            questions
        };

        importedPacks.unshift(importedPack);
        saveImportedPacks();
        rebuildPackList();
        setImportStatus(`Đã import "${title}" với ${questions.length} câu.`, "success");
        selectPack(importedPack);
    } catch (error) {
        console.error("Import thất bại:", error);
        setImportStatus(error.message || "File JSON không hợp lệ.", "error");
    } finally {
        if (eventOrFile?.target) {
            eventOrFile.target.value = "";
        }
    }
}

function readImportedPacks() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_IMPORTED_KEY)) || [];
        return parsed.filter(pack => pack.imported && Array.isArray(pack.questions));
    } catch {
        return [];
    }
}

function saveImportedPacks() {
    localStorage.setItem(STORAGE_IMPORTED_KEY, JSON.stringify(importedPacks));
}

function removeImportedPack(packId) {
    importedPacks = importedPacks.filter(pack => pack.id !== packId);
    saveImportedPacks();

    if (selectedPack?.id === packId) {
        selectedPack = null;
        els.btnOpenQuiz.disabled = true;
        els.selectedPackSummary.innerHTML = `
            <span>Gói đang chọn</span>
            <strong>Chưa chọn gói</strong>
            <small>Chọn một chủ đề bên dưới để tiếp tục.</small>
        `;
    }

    if (currentPackId === packId) {
        stopTimer();
        activePack = null;
        currentPackId = null;
        baseQuestions = [];
        currentQuestions = [];
        userAnswers = {};
        score = 0;
        els.quizContainer.hidden = true;
        els.emptyState.hidden = false;
        els.quizTitle.textContent = "Chọn một gói câu hỏi để bắt đầu";
        els.activePackLabel.textContent = "Chưa chọn gói";
        els.btnResetSession.disabled = true;
        showSetupView();
        updateOverallProgress();
        updateStatsDisplay();
    }

    rebuildPackList();
    setImportStatus("Đã gỡ gói import khỏi trình duyệt.", "success");
}

function setImportStatus(message, type) {
    els.importStatus.textContent = message;
    els.importStatus.className = `status-text ${type || ""}`;
}

function showSampleDialog() {
    if (typeof els.sampleDialog.showModal === "function") {
        els.sampleDialog.showModal();
        return;
    }
    alert(`[
  {
    "question": "What is a stack?",
    "options": ["A. FIFO data structure", "B. LIFO data structure"],
    "answer": "B",
    "explanation": "A stack follows Last In, First Out."
  }
]`);
}

function cleanTitle(value) {
    return value
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, char => char.toUpperCase()) || "Gói import";
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", init);
