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

const translationCache = new Map();
const sentenceCache = new Map(); // Bộ đệm cho các câu dài (giải thích)
// Khởi tạo bộ đệm (Hash Cache) với từ điển ban đầu
dictionaryData.forEach(item => translationCache.set(item.term.toLowerCase(), item.def));

const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'in', 'to', 'a', 'an', 'and', 'for', 'of', 'with', 'by', 'as', 'it', 'that', 'this', 'be', 'are', 'or', 'not', 'if', 'then', 'there', 'such', 'can', 'has', 'have', 'from', 'but', 'when', 'how', 'what', 'why', 'will', 'would', 'should', 'could', 'about', 'into', 'only', 'than', 'over', 'also', 'some', 'any', 'very', 'much', 'more', 'most']);

const availablePacks = [
    {
        id: 'algo_analysis',
        title: 'Phân Tích Thuật Toán',
        desc: 'Đánh giá độ phức tạp O-lớn, Omega, Theta.',
        file: './src/data/Algorithm_Analysis.json'
    },
    {
        id: 'linked_lists',
        title: 'Danh Sách Liên Kết',
        desc: 'Singly, Doubly, Circular Linked Lists và ứng dụng.',
        file: './src/data/Linked_Lists.json'
    },
    {
        id: 'stacks_queues',
        title: 'Ngăn Xếp & Hàng Đợi',
        desc: 'Cấu trúc LIFO/FIFO, cài đặt mảng và danh sách liên kết.',
        file: './src/data/Stacks-Queues.json'
    },
    {
        id: 'search_sort',
        title: 'Tìm Kiếm & Sắp Xếp',
        desc: 'Sequential, Binary Search và các thuật toán sắp xếp cơ bản.',
        file: './src/data/Searching_Sorting.json'
    },
    {
        id: 'trees',
        title: 'Cây (Trees)',
        desc: 'Binary Trees, Binary Search Trees và Forests.',
        file: './src/data/Trees.json'
    },
    {
        id: 'heaps',
        title: 'Hàng Đợi Ưu Tiên (Heap)',
        desc: 'Max/Min Heap, Heap Sort và các thao tác cơ bản.',
        file: './src/data/Heaps.json'
    },
    {
        id: 'graphs',
        title: 'Đồ Thị (Graphs)',
        desc: 'Thuật ngữ, biểu diễn đồ thị và các thuật toán duyệt BFS/DFS.',
        file: './src/data/Graphs.json'
    },
    {
        id: 'hash_table',
        title: 'Bảng Băm (Hash Table)',
        desc: 'Static Hashing, Dynamic Hashing và giải quyết xung đột.',
        file: './src/data/Hash_Table.json'
    }
];

// App State
let currentQuestions = [];
let currentPackId = null;
let currentQuestionIndex = 0;
let userAnswers = {}; // { index: selectedOptionIndex }
let score = 0;

// DOM Elements
const packListEl = document.getElementById('pack-list');
const quizContainer = document.getElementById('quiz-container');
const emptyState = document.getElementById('empty-state');
const quizTitle = document.getElementById('quiz-title');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const explanationContainer = document.getElementById('explanation-card');
const explanationText = document.getElementById('explanation-text');
const explanationTranslated = document.getElementById('explanation-translated');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const questionCounter = document.getElementById('question-counter');
const scoreDisplay = document.getElementById('score-display');
const progressBar = document.getElementById('overall-progress-bar');
const progressText = document.getElementById('progress-text');

const dictListEl = document.getElementById('dict-list');
const dictSearchEl = document.getElementById('dict-search');

// Initialization
function init() {
    renderPacks();
    renderDictionary(dictionaryData);

    // Search listener
    dictSearchEl.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();

        if (query === '') {
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
    });

    btnNext.addEventListener('click', handleNext);
    btnPrev.addEventListener('click', handlePrev);
}

// Sidebar Packs
function renderPacks() {
    packListEl.innerHTML = '';
    availablePacks.forEach(pack => {
        const item = document.createElement('div');
        item.className = `pack-item ${currentPackId === pack.id ? 'active' : ''}`;
        item.innerHTML = `
            <h3>${pack.title}</h3>
            <p>${pack.desc}</p>
        `;
        item.addEventListener('click', () => loadPack(pack));
        packListEl.appendChild(item);
    });
}

// Load a specific question pack
async function loadPack(pack) {
    try {
        const response = await fetch(pack.file);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        currentPackId = pack.id;
        currentQuestions = data;

        // Load saved progress from localStorage
        loadProgress(pack.id);

        quizTitle.textContent = pack.title;
        emptyState.style.display = 'none';
        quizContainer.style.display = 'flex';

        renderPacks(); // Update active state in sidebar
        updateOverallProgress();
        showQuestion();
    } catch (error) {
        console.error('Lỗi khi tải bộ câu hỏi:', error);
        alert('Không thể tải bộ câu hỏi này. Vui lòng thử lại sau.');
    }
}

// Progress Management
function loadProgress(packId) {
    const saved = localStorage.getItem(`quiz_progress_${packId}`);
    if (saved) {
        const parsed = JSON.parse(saved);
        userAnswers = parsed.answers || {};
        currentQuestionIndex = parsed.currentIndex || 0;
        calculateScore();
    } else {
        userAnswers = {};
        currentQuestionIndex = 0;
        score = 0;
    }
}

function saveProgress() {
    if (!currentPackId) return;
    const data = {
        answers: userAnswers,
        currentIndex: currentQuestionIndex
    };
    localStorage.setItem(`quiz_progress_${currentPackId}`, JSON.stringify(data));
}

function calculateScore() {
    score = 0;
    for (let i = 0; i < currentQuestions.length; i++) {
        if (userAnswers[i] !== undefined) {
            const question = currentQuestions[i];
            const correctLetter = question.answer.trim();
            const selectedText = question.options[userAnswers[i]];
            if (selectedText.startsWith(correctLetter)) {
                score++;
            }
        }
    }
}

function updateOverallProgress() {
    const total = currentQuestions.length;
    const answered = Object.keys(userAnswers).length;
    const percentage = total > 0 ? (answered / total) * 100 : 0;

    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${answered} / ${total} câu`;
}

// Quiz Rendering
function showQuestion() {
    if (currentQuestions.length === 0) return;

    const question = currentQuestions[currentQuestionIndex];
    questionCounter.textContent = `Câu ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    scoreDisplay.textContent = `Đúng: ${score}`;

    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';

    // Reset feedback
    explanationContainer.style.display = 'none';
    explanationContainer.className = 'explanation-card';
    explanationTranslated.textContent = '';

    const hasAnswered = userAnswers[currentQuestionIndex] !== undefined;

    question.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = optText;

        if (hasAnswered) {
            btn.disabled = true;
            // Check if this option is the selected one or the correct one
            const correctLetter = question.answer.trim();
            const isCorrectOption = optText.startsWith(correctLetter);
            const isSelectedOption = userAnswers[currentQuestionIndex] === idx;

            if (isCorrectOption) {
                btn.classList.add('correct');
            } else if (isSelectedOption && !isCorrectOption) {
                btn.classList.add('wrong');
            }
        } else {
            btn.addEventListener('click', () => handleOptionSelect(idx));
        }

        optionsContainer.appendChild(btn);
    });

    if (hasAnswered) {
        showFeedback(question, userAnswers[currentQuestionIndex]);
    }

    // Update navigation buttons
    btnPrev.disabled = currentQuestionIndex === 0;
    btnNext.textContent = currentQuestionIndex === currentQuestions.length - 1 ? 'Kết thúc' : 'Câu tiếp theo';

    // Highlight relevant dictionary terms
    updateDictionaryForCurrentQuestion(question);
}

function handleOptionSelect(optionIdx) {
    userAnswers[currentQuestionIndex] = optionIdx;
    calculateScore();
    saveProgress();
    updateOverallProgress();
    showQuestion(); // Re-render to show correct/wrong states and feedback
}

function showFeedback(question, selectedIdx) {
    const correctLetter = question.answer.trim();
    const selectedText = question.options[selectedIdx];
    const isCorrect = selectedText.startsWith(correctLetter);

    explanationContainer.style.display = 'block';
    explanationContainer.classList.add(isCorrect ? 'correct' : 'wrong');

    explanationText.innerHTML = `<strong>${isCorrect ? '✨ Chính xác!' : '❌ Không chính xác!'}</strong><br>${question.explanation || 'Không có giải thích chi tiết cho câu này.'}`;

    // Gọi hàm dịch giải thích
    if (question.explanation) {
        translateExplanation(question.explanation);
    }
}

async function translateExplanation(text) {
    if (sentenceCache.has(text)) {
        explanationTranslated.textContent = sentenceCache.get(text);
        return;
    }

    explanationTranslated.textContent = '⏳ Đang dịch giải thích...';

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`);
        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            const translated = data.responseData.translatedText;
            sentenceCache.set(text, translated);
            explanationTranslated.textContent = translated;
        } else {
            explanationTranslated.textContent = '';
        }
    } catch (error) {
        console.error('Lỗi dịch giải thích:', error);
        explanationTranslated.textContent = '(Không thể tải bản dịch giải thích)';
    }
}

function handleNext() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        saveProgress();
        showQuestion();
    } else {
        alert(`Chúc mừng bạn đã hoàn thành bộ câu hỏi!\nSố câu trả lời đúng: ${score} / ${currentQuestions.length}`);
    }
}

function handlePrev() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        saveProgress();
        showQuestion();
    }
}

// Dictionary Rendering
function renderDictionary(data) {
    dictListEl.innerHTML = '';
    if (data.length === 0) {
        dictListEl.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Không tìm thấy từ vựng.</p>';
        return;
    }

    data.forEach(item => {
        const el = document.createElement('div');
        el.className = 'dict-item';
        el.innerHTML = `
            <div class="dict-term">${item.term}</div>
            <div class="dict-def">${item.def}</div>
        `;
        dictListEl.appendChild(el);
    });
}

function showLoadingIndicator() {
    const loader = document.getElementById('dict-loader');
    if (!loader) {
        const div = document.createElement('div');
        div.id = 'dict-loader';
        div.style.textAlign = 'center';
        div.style.padding = '10px';
        div.style.color = 'var(--text-secondary)';
        div.style.fontSize = '0.85rem';
        div.style.fontStyle = 'italic';
        div.innerHTML = '⏳ Đang dịch thêm từ mới bằng API...';
        // Insert right below the header
        const header = dictListEl.querySelector('div[style*="💡"]');
        if (header && header.nextSibling) {
            dictListEl.insertBefore(div, header.nextSibling);
        } else {
            dictListEl.insertBefore(div, dictListEl.firstChild);
        }
    }
}

async function updateDictionaryForCurrentQuestion(question) {
    if (dictSearchEl.value.trim() !== '') return;

    const fullText = (question.question + " " + question.options.join(" ") + " " + (question.explanation || "")).toLowerCase();

    // 1. Phân tích các từ có trong câu (Tokenization)
    const words = fullText.replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));
    const uniqueWords = [...new Set(words)]; // Loại bỏ từ trùng lặp

    let knownTerms = [];
    let unknownWords = [];

    // 2. Quét cụm từ dài có sẵn trong từ điển (Multi-word terms)
    dictionaryData.forEach(item => {
        if (item.term.includes(' ') && fullText.includes(item.term.toLowerCase())) {
            knownTerms.push(item);
        }
    });

    // 3. Quét các từ đơn bằng Hash Table (O(1))
    uniqueWords.forEach(w => {
        if (translationCache.has(w)) {
            if (!knownTerms.find(k => k.term.toLowerCase() === w) && translationCache.get(w) !== "Không rõ") {
                knownTerms.push({ term: w.charAt(0).toUpperCase() + w.slice(1), def: translationCache.get(w) });
            }
        } else {
            unknownWords.push(w);
        }
    });

    // 4. Render danh sách đã biết ngay lập tức (Zero Latency)
    if (knownTerms.length > 0) {
        renderDictionaryWithHighlight(knownTerms, dictionaryData);
    } else {
        renderDictionary(dictionaryData);
    }

    // 5. Gọi API cho tối đa 3 từ chưa biết (Tránh bị Rate limit của API Free)
    const wordsToFetch = unknownWords.slice(0, 3);
    if (wordsToFetch.length > 0) {
        showLoadingIndicator();

        const fetchPromises = wordsToFetch.map(async (word) => {
            try {
                const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`);
                const data = await res.json();
                if (data && data.responseData && data.responseData.translatedText) {
                    let translated = data.responseData.translatedText;

                    // Lọc những từ dịch không thành công
                    if (translated.toLowerCase() !== word.toLowerCase()) {
                        translationCache.set(word, translated);

                        const newTerm = { term: word.charAt(0).toUpperCase() + word.slice(1), def: translated };
                        dictionaryData.push(newTerm);
                        knownTerms.push(newTerm);
                    } else {
                        translationCache.set(word, "Không rõ"); // Cache miss để lần sau không gọi API lại
                    }
                }
            } catch (e) {
                console.error("Lỗi khi gọi API dịch thuật:", e);
            }
        });

        await Promise.all(fetchPromises);

        // 6. Cập nhật lại UI sau khi có kết quả từ API
        if (dictSearchEl.value.trim() === '') {
            renderDictionaryWithHighlight(knownTerms, dictionaryData);
        }
    }
}

function renderDictionaryWithHighlight(relevantTerms, allTerms) {
    dictListEl.innerHTML = '';

    const headerEl = document.createElement('div');
    headerEl.style.color = 'var(--accent-primary)';
    headerEl.style.fontSize = '0.9rem';
    headerEl.style.fontWeight = '600';
    headerEl.style.padding = '0 10px 8px';
    headerEl.style.marginTop = '4px';
    headerEl.textContent = '💡 Từ vựng trong câu này:';
    dictListEl.appendChild(headerEl);

    relevantTerms.forEach(item => {
        const el = document.createElement('div');
        el.className = 'dict-item';
        el.style.borderLeft = '3px solid var(--accent-primary)';
        el.style.backgroundColor = 'rgba(14, 165, 233, 0.05)';
        el.innerHTML = `
            <div class="dict-term">${item.term}</div>
            <div class="dict-def">${item.def}</div>
        `;
        dictListEl.appendChild(el);
    });

    const divider = document.createElement('hr');
    divider.style.border = 'none';
    divider.style.borderTop = '1px solid var(--border-color)';
    divider.style.margin = '16px 0';
    dictListEl.appendChild(divider);

    const otherTerms = allTerms.filter(t => !relevantTerms.includes(t));

    otherTerms.forEach(item => {
        const el = document.createElement('div');
        el.className = 'dict-item';
        el.innerHTML = `
            <div class="dict-term">${item.term}</div>
            <div class="dict-def">${item.def}</div>
        `;
        dictListEl.appendChild(el);
    });
}

// Start app
document.addEventListener('DOMContentLoaded', init);
