"use strict";

const $ = id => document.getElementById(id);


/* ==================================
   مدیریت صفحه‌ها
================================== */

const screens = [
    "welcome",
    "menu",
    "stageOne",
    "stageTwo",
    "stageThree",
    "finish"
];

function showScreen(id) {

    screens.forEach(screen => {
        $(screen).classList.remove("active");
    });

    $(id).classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ==================================
   صداهای بازی
================================== */
/* ==================================
   صداهای بازی و افکت تشویق
================================== */

let gameAudio = null;

function getAudio() {

    const AudioContext =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return null;

    if (!gameAudio) {
        gameAudio = new AudioContext();
    }

    if (gameAudio.state === "suspended") {
        gameAudio.resume();
    }

    return gameAudio;
}


function playSound(type) {

    try {

        const audio = getAudio();

        if (!audio) return;

        const now = audio.currentTime;

        if (type === "good") {

            const notes = [523, 659, 784, 1046];

            notes.forEach((frequency, index) => {

                const oscillator = audio.createOscillator();
                const gain = audio.createGain();

                oscillator.type = "sine";
                oscillator.frequency.value = frequency;

                oscillator.connect(gain);
                gain.connect(audio.destination);

                const start = now + index * 0.11;

                gain.gain.setValueAtTime(0.001, start);
                gain.gain.linearRampToValueAtTime(0.16, start + 0.025);
                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    start + 0.3
                );

                oscillator.start(start);
                oscillator.stop(start + 0.32);

            });

        } else {

            const oscillator = audio.createOscillator();
            const gain = audio.createGain();

            oscillator.type = "triangle";
            oscillator.frequency.value = 220;

            oscillator.connect(gain);
            gain.connect(audio.destination);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now + 0.3
            );

            oscillator.start(now);
            oscillator.stop(now + 0.3);

        }

    } catch (error) {
        console.log("Audio unavailable:", error);
    }

}


/* ==================================
   افکت فشفشه و کاغذرنگی
================================== */

function celebrate() {

    const overlay = document.createElement("div");

    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
        z-index: 99999;
    `;

    document.body.appendChild(overlay);

    const colors = [
        "#ff3b6b",
        "#ffd43b",
        "#35c9ff",
        "#8b5cf6",
        "#39d98a",
        "#ff8c42",
        "#ffffff"
    ];

    for (let burst = 0; burst < 4; burst++) {

        const centerX = Math.random() * 80 + 10;
        const centerY = Math.random() * 55 + 15;

        for (let i = 0; i < 24; i++) {

            const particle = document.createElement("div");

            const angle = Math.PI * 2 * i / 24;
            const distance = 70 + Math.random() * 110;

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            const size = 5 + Math.random() * 7;

            particle.style.cssText = `
                position: absolute;
                left: ${centerX}%;
                top: ${centerY}%;
                width: ${size}px;
                height: ${size}px;
                border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                box-shadow: 0 0 8px currentColor;
            `;

            overlay.appendChild(particle);

            particle.animate(
                [
                    {
                        transform: "translate(0,0) scale(0.3) rotate(0deg)",
                        opacity: 1
                    },
                    {
                        transform: `translate(${x}px,${y}px) scale(1.2) rotate(360deg)`,
                        opacity: 0
                    }
                ],
                {
                    duration: 1100 + Math.random() * 500,
                    easing: "cubic-bezier(.15,.7,.3,1)",
                    fill: "forwards"
                }
            );

        }

    }

    setTimeout(() => {
        overlay.remove();
    }, 1800);

}

/* ==================================
   صدای لمس دکمه‌ها
================================== */

document.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    if (
        button.disabled ||
        button.classList.contains("letter-box") ||
        button.classList.contains("sentence-box") ||
        button.classList.contains("friend-cell")
    ) {
        return;
    }

    playClickSound();

});


function playClickSound() {

    try {

        const audio = getAudio();

        if (!audio) return;

        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            720,
            audio.currentTime
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            950,
            audio.currentTime + 0.07
        );

        oscillator.connect(gain);
        gain.connect(audio.destination);

        gain.gain.setValueAtTime(
            0.08,
            audio.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audio.currentTime + 0.12
        );

        oscillator.start();

        oscillator.stop(audio.currentTime + 0.12);

    } catch (error) {
        console.log("Click sound unavailable");
    }

}

/* ==================================
   نام دانش‌آموز
================================== */

let student = "";

$("startButton").addEventListener("click", () => {

    student = $("studentName").value.trim();

    if (!student) {

        $("studentName").focus();

        $("studentName").placeholder =
            "اول نامت را بنویس!";

        return;

    }

    $("displayName").textContent = student;

    showScreen("menu");

});


/* ==================================
   دکمه‌های انتخاب مرحله
================================== */

$("stageOneButton").addEventListener("click", () => {
    showScreen("stageOne");
});

$("stageTwoButton").addEventListener("click", () => {
    startWordGame();
    showScreen("stageTwo");
});

$("stageThreeButton").addEventListener("click", () => {
    startSentenceGame();
    showScreen("stageThree");
});

$("backToMenu1").addEventListener("click", () => {
    showScreen("menu");
});

$("backToMenu2").addEventListener("click", () => {
    showScreen("menu");
});

$("backToMenu3").addEventListener("click", () => {
    showScreen("menu");
});

$("menuButton").addEventListener("click", () => {
    showScreen("menu");
});


/* ==================================
   مرحله اول: جدول دوستی
================================== */

/*
نشانه‌های بالای جدول:

آ      غیرقابل ترکیب
ا      قابل ترکیب
اَ     غیرقابل ترکیب
ـَ     قابل ترکیب
او     غیرقابل ترکیب
و      قابل ترکیب

نشانه‌های کنار جدول:

بـ
د
مـ
سـ
تـ

در ستون ـَ شکل غیرآخر حفظ می‌شود.
*/

const columns = [

    { label: "آ", valid: false },

    { label: "ا", valid: true, type: "alef" },

    { label: "اَ", valid: false },

    { label: "ـَ", valid: true, type: "fatha" },

    { label: "او", valid: false },

    { label: "و", valid: true, type: "vav" }

];


const rows = [

    { label: "بـ", letter: "بـ" },

    { label: "د", letter: "د" },

    { label: "مـ", letter: "مـ" },

    { label: "سـ", letter: "سـ" },

    { label: "تـ", letter: "تـ" }

];


const table = $("friendTable");

let completedCells = new Set();

let selectedRow = null;


/* ساخت ترکیب درست */

function makeCombination(rowIndex, colIndex) {

    const letter = rows[rowIndex].letter;

    const column = columns[colIndex];

    if (!column.valid) {
        return "❌";
    }

    if (column.type === "alef") {

        return letter.replace("ـ", "") + "ا";

    }

    if (column.type === "fatha") {

        return letter + "َ";

    }

    if (column.type === "vav") {

        return letter.replace("ـ", "") + "و";

    }

    return "❌";

}


/* ساخت جدول */

function buildTable() {

    table.innerHTML = "";

    selectedRow = null;

    const header = document.createElement("tr");

    const empty = document.createElement("th");

    empty.textContent = "دوستی";

    header.appendChild(empty);


    columns.forEach((column, colIndex) => {

        const th = document.createElement("th");

        const button = document.createElement("button");

        button.className = "friend-cell";

        button.textContent = column.label;

        button.style.background = "#7957ca";

        button.style.color = "white";

        button.style.minWidth = "75px";

        button.addEventListener("click", () => {

            if (selectedRow === null) {

                $("tableFeedback").textContent =
                    "اول یک نشانه از کنار جدول انتخاب کن.";

                $("tableFeedback").className =
                    "feedback bad";

                return;

            }

            fillFriendCell(selectedRow, colIndex);

        });

        th.appendChild(button);

        header.appendChild(th);

    });


    table.appendChild(header);


    rows.forEach((row, rowIndex) => {

        const tr = document.createElement("tr");

        const rowHead = document.createElement("th");

        rowHead.className = "row-head";

        const rowButton = document.createElement("button");

        rowButton.className = "friend-cell";

        rowButton.textContent = row.label;

        rowButton.style.background = "#ed9b4d";

        rowButton.style.color = "white";

        rowButton.addEventListener("click", () => {

            selectedRow = rowIndex;

            document.querySelectorAll(".row-head button").forEach(button => {
                button.classList.remove("selected");
            });

            rowButton.classList.add("selected");

            $("equation").textContent =
                "حالا دوست این نشانه را از بالای جدول انتخاب کن.";

            $("tableFeedback").textContent =
                "نشانهٔ " + row.label + " انتخاب شد.";

            $("tableFeedback").className = "feedback";

        });

        rowHead.appendChild(rowButton);

        tr.appendChild(rowHead);


        columns.forEach((column, colIndex) => {

            const td = document.createElement("td");

            const button = document.createElement("button");

            button.className = "friend-cell";

            button.textContent = "؟";

            button.dataset.row = rowIndex;

            button.dataset.col = colIndex;

            td.appendChild(button);

            tr.appendChild(td);

        });

        table.appendChild(tr);

    });

}


/* پر کردن خانه جدول */

function fillFriendCell(rowIndex, colIndex) {

    const key = rowIndex + "-" + colIndex;

    const button = table.querySelector(
        `button[data-row="${rowIndex}"][data-col="${colIndex}"]`
    );

    if (completedCells.has(key)) {

        $("tableFeedback").textContent =
            "این خانه را قبلاً کامل کرده‌ای.";

        return;

    }

    const result = makeCombination(rowIndex, colIndex);

    button.textContent = result;

    completedCells.add(key);


    if (result === "❌") {

        button.classList.add("invalid");

        $("equation").textContent =
            rows[rowIndex].label + " + " +
            columns[colIndex].label + " = ❌";

        $("tableFeedback").textContent =
            "این نشانه‌ها با هم دوست نمی‌شوند.";

        $("tableFeedback").className =
            "feedback bad";

        playSound("bad");

    } else {

        button.classList.add("completed");

        $("equation").textContent =
            rows[rowIndex].label + " + " +
            columns[colIndex].label + " = " + result;

        $("tableFeedback").textContent =
            "آفرین! ترکیب درست را پیدا کردی. 🌸";

        $("tableFeedback").className =
            "feedback good";

        playSound("good");

    }

    updateTableProgress();

}


/* پیشرفت جدول */

function updateTableProgress() {

    const count = completedCells.size;

    $("tableProgress").textContent =
        count + " از ۳۰";

    $("tableProgressBar").style.width =
        (count / 30 * 100) + "%";

    if (count === 30) {

        $("finishTable").disabled = false;

        $("tableFeedback").textContent =
            "آفرین! همه خانه‌های جدول را کامل کردی. ⭐";

    }

}


/* ورود به مرحله دوم */

$("finishTable").addEventListener("click", () => {

    if (completedCells.size !== 30) {
        return;
    }

    startWordGame();

    showScreen("stageTwo");

});


buildTable();


/* ==================================
   ابزار مشترک مرتب‌سازی
================================== */

function shuffleArray(original) {

    const shuffled = [...original];

    for (let i = shuffled.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];

    }

    if (
        shuffled.join("|") === original.join("|") &&
        shuffled.length > 1
    ) {

        [shuffled[0], shuffled[1]] =
            [shuffled[1], shuffled[0]];

    }

    return shuffled;

}


/* حذف اعراب برای بررسی پاسخ */
function normalizeText(text) {
    return String(text)
        .normalize("NFC")
        .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
        .replace(/\s+/g, "")
        .trim();
}



/* ==================================
   مرحله دوم: قطار واژه‌ها
================================== */

const words = [

    {
        word: "سَبَد",
        letters: ["سـَ", "بـَ", "د"]
    },

    {
        word: "بامداد",
        letters: ["بـ", "ا", "مـ", "د", "ا", "د"]
    },

    {
        word: "بام",
        letters: ["بـ", "ا", "م"]
    },

    {
        word: "بودَم",
        letters: ["بـ", "و", "دَ", "م"]
    },

    {
        word: "توت",
        letters: ["تـ", "و", "ت"]
    },

    {
        word: "تاس",
        letters: ["تـ", "ا", "س"]
    },

    {
        word: "بوس",
        letters: ["بـ", "و", "س"]
    },

    {
        word: "دوست",
        letters: ["د", "و", "سـ", "ت"]
    },

    {
        word: "دام",
        letters: ["د", "ا", "م"]
    },

    {
        word: "آمَدَم",
        letters: ["آ", "مـَ", "دَ", "م"]
    },

    {
        word: "بَدبو",
        letters: ["بَـ", "د", "بـ", "و"]
    },

    {
        word: "دود",
        letters: ["د", "و", "د"]
    },

    {
        word: "بود",
        letters: ["بـ", "و", "د"]
    },

    {
        word: "موم",
        letters: ["مـ", "و", "م"]
    },

    {
        word: "دَست",
        letters: ["دَ", "سـ", "ت"]
    }

];


let currentWordIndex = 0;

let currentLetters = [];

let selectedBox = null;

let correctWords = 0;


function startWordGame() {

    currentWordIndex = 0;

    correctWords = 0;

    $("wordScore").textContent = "۰ از ۱۵";

    $("wordProgressBar").style.width = "0%";

    loadWord();

}


function loadWord() {

    selectedBox = null;

    const item = words[currentWordIndex];

    currentLetters = shuffleArray(item.letters);

    $("wordNumber").textContent =
        currentWordIndex + 1;

    $("wordFeedback").textContent = "";

    $("wordFeedback").className = "feedback";

    $("checkWord").disabled = false;

    $("nextWord").disabled = true;

    $("currentWord").textContent = "؟";

    renderLetters();

}


function renderLetters() {

    const container = $("letterBoxes");

    container.innerHTML = "";

    currentLetters.forEach((letter, index) => {

        const box = document.createElement("button");

        box.className = "letter-box";

        box.textContent = letter;

        box.addEventListener("click", () => {

            selectLetter(index);

        });

        container.appendChild(box);

    });

    updateCurrentWord();

}


function selectLetter(index) {

    if ($("checkWord").disabled) {
        return;
    }

    const boxes = document.querySelectorAll(".letter-box");

    if (selectedBox === null) {

        selectedBox = index;

        boxes[index].classList.add("selected");

        return;

    }

    if (selectedBox === index) {

        boxes[index].classList.remove("selected");

        selectedBox = null;

        return;

    }

    const first = selectedBox;

    const second = index;

    [currentLetters[first], currentLetters[second]] =
        [currentLetters[second], currentLetters[first]];

    selectedBox = null;

    renderLetters();

}


function updateCurrentWord() {

    $("currentWord").textContent =
        currentLetters.join("");

}


/* بررسی واژه */

$("checkWord").addEventListener("click", () => {

    const answer = currentLetters.join("");

    const correct = words[currentWordIndex].word;

    if (
        normalizeText(answer) ===
        normalizeText(correct)
    ) {

        $("wordFeedback").textContent =
            "آفرین! واژه را درست ساختی! ⭐";

        $("wordFeedback").className =
            "feedback good";

        $("currentWord").textContent = correct;

        document.querySelectorAll(".letter-box").forEach(box => {
            box.classList.add("correct");
        });

        $("checkWord").disabled = true;

        $("nextWord").disabled = false;

        correctWords++;

        updateWordProgress();

        playSound("good");
        celebrate();

    } else {

        $("wordFeedback").textContent =
            "یک بار دیگر نشانه‌ها را مرتب کن. 🌷";

        $("wordFeedback").className =
            "feedback bad";

        playSound("bad");

    }

});


function updateWordProgress() {

    $("wordScore").textContent =
        correctWords + " از ۱۵";

    $("wordProgressBar").style.width =
        (correctWords / 15 * 100) + "%";

}


$("nextWord").addEventListener("click", () => {

    currentWordIndex++;

    if (currentWordIndex >= words.length) {

        startSentenceGame();

        showScreen("stageThree");

        return;

    }

    loadWord();

});


/* ==================================
   مرحله سوم: جمله‌سازی
================================== */

/*
جمله‌های پذیرفته‌شده:

۱. بابا با داماد بامداد آمد.

۲. دود بدبو بود.

۳. سما با سبا آدامس داد.
   سبا با سما آدامس داد.

۴. با او بادام دادم.

۵. او با اسب آمد.

۶. او با دست توت داد.

۷. سام با اسما دوست است.
   اسما با سما دوست است. 
*/


const sentences = [

    {
        correct: [
            ["بابا", "با", "داماد", "بامداد", "آمَد"],
            ["بابا", "با", "داماد", "بامداد", "آمد"]
        ],

        scrambled: [
            "آمَد",
            "داماد",
            "بابا",
            "با",
            "بامداد"
        ]

    },


    {
        correct: [
            ["دود", "بَدبو", "بود"],
            ["دود", "بدبو", "بود"]
        ],

        scrambled: [
            "بَدبو",
            "دود",
            "بود"
        ]

    },


    {
        correct: [
            ["سَما", "با", "سَبا", "آدامس", "داد"],
            ["سَبا", "با", "سَما", "آدامس", "داد"],
            ["سما", "با", "سبا", "آدامس", "داد"],
            ["سبا", "با", "سما", "آدامس", "داد"]
        ],

        scrambled: [
            "سَبا",
            "داد",
            "آدامس",
            "با",
            "سَما"
        ]

    },


    {
        correct: [
            ["با", "او", "بادام", "دادَم"],
            ["با", "او", "بادام", "دادم"]
        ],

        scrambled: [
            "دادَم",
            "او",
            "با",
            "بادام"
        ]

    },


    {
        correct: [
            ["او", "با", "اَسب", "آمَد"],
            ["او", "با", "اسب", "آمد"]
        ],

        scrambled: [
            "آمَد",
            "اَسب",
            "او",
            "با"
        ]

    },


    {
        correct: [
            ["او", "با", "دَست", "توت", "داد"],
            ["او", "با", "دست", "توت", "داد"]
        ],

        scrambled: [
            "توت",
            "دَست",
            "او",
            "داد",
            "با"
        ]

    },


    {
        correct: [
            ["سام", "با", "اَسما", "دوست", "اَست"],
            ["سام", "با", "اسما", "دوست", "است"]
        ],

        scrambled: [
            "سام",
            "دوست",
            "اَست",
            "با",
            "اَسما"
        ]

    }

];


let currentSentenceIndex = 0;

let currentSentenceWords = [];

let selectedSentenceBox = null;

let correctSentences = 0;


/* شروع جمله‌سازی */

function startSentenceGame() {

    currentSentenceIndex = 0;

    correctSentences = 0;

    $("sentenceScore").textContent = "۰ از ۷";

    $("sentenceProgressBar").style.width = "0%";

    loadSentence();

}


/* نمایش جمله */

function loadSentence() {

    selectedSentenceBox = null;

    const item = sentences[currentSentenceIndex];

    currentSentenceWords = shuffleArray(item.scrambled);

    $("sentenceNumber").textContent =
        currentSentenceIndex + 1;

    $("sentenceFeedback").textContent = "";

    $("sentenceFeedback").className = "feedback";

    $("checkSentence").disabled = false;

    $("nextSentence").disabled = true;

    $("currentSentence").textContent = "؟";

    renderSentenceWords();

}


/* ساخت کادر کلمات */

function renderSentenceWords() {

    const container = $("sentenceBoxes");

    container.innerHTML = "";

    currentSentenceWords.forEach((word, index) => {

        const box = document.createElement("button");

        box.className = "sentence-box";

        box.textContent = word;

        box.addEventListener("click", () => {

            selectSentenceWord(index);

        });

        container.appendChild(box);

    });

    updateCurrentSentence();

}


/* جابه‌جایی کلمات */

function selectSentenceWord(index) {

    if ($("checkSentence").disabled) {
        return;
    }

    const boxes = document.querySelectorAll(".sentence-box");

    if (selectedSentenceBox === null) {

        selectedSentenceBox = index;

        boxes[index].classList.add("selected");

        return;

    }

    if (selectedSentenceBox === index) {

        boxes[index].classList.remove("selected");

        selectedSentenceBox = null;

        return;

    }

    const first = selectedSentenceBox;

    const second = index;

    [
        currentSentenceWords[first],
        currentSentenceWords[second]
    ] = [
        currentSentenceWords[second],
        currentSentenceWords[first]
    ];

    selectedSentenceBox = null;

    renderSentenceWords();

}


/* نمایش جمله */

function updateCurrentSentence() {

    $("currentSentence").textContent =
        currentSentenceWords.join(" ") + ".";

}


/* بررسی جمله */

$("checkSentence").addEventListener("click", () => {

    const answer = currentSentenceWords.map(normalizeText);

    const acceptedAnswers =
        sentences[currentSentenceIndex].correct;

    const isCorrect = acceptedAnswers.some(sentence => {

        const normalizedSentence =
            sentence.map(normalizeText);

        return answer.length === normalizedSentence.length &&
            answer.every((word, index) => {
                return word === normalizedSentence[index];
            });

    });


    if (isCorrect) {

        $("sentenceFeedback").textContent =
            "آفرین! جمله را درست ساختی! 🌟";

        $("sentenceFeedback").className =
            "feedback good";

        $("currentSentence").textContent =
            currentSentenceWords.join(" ") + ".";

        document.querySelectorAll(".sentence-box").forEach(box => {

            box.classList.add("correct");

        });

        $("checkSentence").disabled = true;

        $("nextSentence").disabled = false;

        correctSentences++;

        updateSentenceProgress();

        playSound("good");
        celebrate();

    } else {

        $("sentenceFeedback").textContent =
            "هنوز جمله درست نشده؛ دوباره کلمه‌ها را مرتب کن. 🌷";

        $("sentenceFeedback").className =
            "feedback bad";

        playSound("bad");

    }

});


/* پیشرفت جمله‌ها */

function updateSentenceProgress() {

    $("sentenceScore").textContent =
        correctSentences + " از ۷";

    $("sentenceProgressBar").style.width =
        (correctSentences / 7 * 100) + "%";

}


/* جمله بعدی */

$("nextSentence").addEventListener("click", () => {

    currentSentenceIndex++;

    if (currentSentenceIndex >= sentences.length) {

        finishGame();

        return;

    }

    loadSentence();

});


/* ==================================
   پایان بازی
================================== */

function finishGame() {

    $("finishMessage").textContent =
        "آفرین " + student +
        "! تو هر سه مرحله را با موفقیت پشت سر گذاشتی. 🌟";

    playSound("good");
    celebrate();

    showScreen("finish");

}


/* ==================================
   شروع دوباره بازی
================================== */

$("restartButton").addEventListener("click", () => {

    completedCells.clear();

    buildTable();

    $("equation").textContent =
        "برای شروع، یک نشانه از کنار جدول انتخاب کن.";

    $("tableFeedback").textContent = "";

    $("finishTable").disabled = true;

    updateTableProgress();

    startWordGame();

    startSentenceGame();

    showScreen("menu");

});
