"use strict";

/* ابزارهای اصلی */

const $ = id => document.getElementById(id);

const screens = [
    "welcome",
    "menu",
    "stageOne",
    "stageTwo",
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


/* صداهای بازی */

function playSound(type) {

    try {

        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        const audio = new AudioContext();

        const oscillator = audio.createOscillator();

        const gain = audio.createGain();

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.type = "sine";

        if (type === "good") {
            oscillator.frequency.value = 880;
        } else {
            oscillator.frequency.value = 260;
        }

        gain.gain.setValueAtTime(0.15, audio.currentTime);

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audio.currentTime + 0.25
        );

        oscillator.start();

        oscillator.stop(audio.currentTime + 0.25);

    } catch (error) {
        console.log("Audio unavailable");
    }
}


/* نام دانش‌آموز */

let student = "";

$("startButton").addEventListener("click", () => {

    student = $("studentName").value.trim();

    if (!student) {
        $("studentName").focus();
        $("studentName").placeholder = "اول نامت را بنویس!";
        return;
    }

    $("displayName").textContent = student;

    showScreen("menu");

});


/* رفت‌وآمد بین مراحل */

$("stageOneButton").addEventListener("click", () => {
    showScreen("stageOne");
});

$("stageTwoButton").addEventListener("click", () => {
    startWordGame();
    showScreen("stageTwo");
});

$("backToMenu1").addEventListener("click", () => {
    showScreen("menu");
});

$("backToMenu2").addEventListener("click", () => {
    showScreen("menu");
});

$("menuButton").addEventListener("click", () => {
    showScreen("menu");
});


/* ==================================
   مرحله اول: جدول دوستی نشانه‌ها
================================== */

const columns = [
    "آ",
    "ا",
    "اَ",
    "ـَ",
    "او",
    "و"
];

const rows = [
    "بـ",
    "دـ",
    "مـ",
    "سـ",
    "تـ"
];

const rowLetters = [
    "ب",
    "د",
    "م",
    "س",
    "ت"
];

const table = $("friendTable");

let completedCells = new Set();


/*
خروجی نوشتاری ترکیب‌ها:

آ و ا: الف بلند
اَ و ـَ: صدای کوتاه اَ
او و و: صدای او
*/

function makeCombination(rowIndex, colIndex) {

    const letter = rowLetters[rowIndex];

    if (colIndex === 0 || colIndex === 1) {
        return letter + "ا";
    }

    if (colIndex === 2 || colIndex === 3) {
        return letter + "َ";
    }

    return letter + "و";
}


function buildTable() {

    table.innerHTML = "";

    const header = document.createElement("tr");

    const empty = document.createElement("th");

    empty.textContent = "دوستی";

    header.appendChild(empty);

    columns.forEach(column => {

        const th = document.createElement("th");

        th.textContent = column;

        header.appendChild(th);

    });

    table.appendChild(header);


    rows.forEach((row, rowIndex) => {

        const tr = document.createElement("tr");

        const rowHead = document.createElement("th");

        rowHead.className = "row-head";

        rowHead.textContent = row;

        tr.appendChild(rowHead);


        columns.forEach((column, colIndex) => {

            const td = document.createElement("td");

            const button = document.createElement("button");

            button.className = "friend-cell";

            button.textContent = "＋";

            button.dataset.row = rowIndex;
            button.dataset.col = colIndex;

            button.addEventListener("click", () => {

                selectFriend(rowIndex, colIndex, button);

            });

            td.appendChild(button);

            tr.appendChild(td);

        });

        table.appendChild(tr);

    });

}


function selectFriend(rowIndex, colIndex, button) {

    const key = rowIndex + "-" + colIndex;

    const combination = makeCombination(
        rowIndex,
        colIndex
    );

    const rowLetter = rowLetters[rowIndex];

    const column = columns[colIndex];

    if (!completedCells.has(key)) {

        completedCells.add(key);

        button.textContent = combination;

        button.classList.add("completed");

        $("equation").textContent =
            rowLetter + " + " + column +
            " = " + combination;

        $("tableFeedback").textContent =
            "ترکیب ساخته شد! 🌸";

        $("tableFeedback").className = "feedback good";

        playSound("good");

    } else {

        $("equation").textContent =
            rowLetter + " + " + column +
            " = " + combination;

    }

    updateTableProgress();

}


function updateTableProgress() {

    const count = completedCells.size;

    $("tableProgress").textContent =
        count + " از ۳۰";

    $("tableProgressBar").style.width =
        (count / 30 * 100) + "%";

    if (count === 30) {

        $("finishTable").disabled = false;

        $("tableFeedback").textContent =
            "آفرین! همه خانه‌ها کامل شدند. ⭐";

    }

}


$("finishTable").addEventListener("click", () => {

    if (completedCells.size !== 30) {
        return;
    }

    playSound("good");

    startWordGame();

    showScreen("stageTwo");

});


buildTable();


/* ==================================
   مرحله دوم: مرتب‌سازی واژه‌ها
================================== */

/*
هر کلمه به نشانه‌های جداگانه تقسیم شده است.
اعراب به نشانه مربوط به خود چسبیده‌اند.
*/

const words = [

    {
        word: "سَبَد",
        letters: ["سَ", "ب", "د"]
    },

    {
        word: "بامداد",
        letters: ["ب", "ا", "م", "د", "ا", "د"]
    },

    {
        word: "بام",
        letters: ["ب", "ا", "م"]
    },

    {
        word: "بودَم",
        letters: ["ب", "و", "دَ", "م"]
    },

    {
        word: "توت",
        letters: ["ت", "و", "ت"]
    },

    {
        word: "تاس",
        letters: ["ت", "ا", "س"]
    },

    {
        word: "بوس",
        letters: ["ب", "و", "س"]
    },

    {
        word: "دوست",
        letters: ["د", "و", "س", "ت"]
    },

    {
        word: "دام",
        letters: ["د", "ا", "م"]
    },

    {
        word: "آمَدَم",
        letters: ["آ", "مَ", "دَ", "م"]
    },

    {
        word: "بَدبو",
        letters: ["بَ", "د", "ب", "و"]
    },

    {
        word: "دود",
        letters: ["د", "و", "د"]
    },

    {
        word: "بود",
        letters: ["ب", "و", "د"]
    },

    {
        word: "موم",
        letters: ["م", "و", "م"]
    },

    {
        word: "دَست",
        letters: ["دَ", "س", "ت"]
    }

];


let currentWordIndex = 0;

let currentLetters = [];

let selectedBox = null;

let correctWords = 0;


/* به‌هم‌ریختن نشانه‌ها */

function shuffleLetters(original) {

    const shuffled = [...original];

    for (let i = shuffled.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];

    }

    /*
    اگر اتفاقاً کلمه درست باقی مانده باشد،
    دو نشانه را جابه‌جا می‌کنیم.
    */

    if (
        shuffled.join("|") === original.join("|") &&
        shuffled.length > 1
    ) {

        [shuffled[0], shuffled[1]] =
            [shuffled[1], shuffled[0]];

    }

    return shuffled;

}


/* شروع بازی واژه‌ها */

function startWordGame() {

    currentWordIndex = 0;

    correctWords = 0;

    $("wordScore").textContent = "۰ از ۱۵";

    $("wordProgressBar").style.width = "0%";

    loadWord();

}


/* نمایش واژه */

function loadWord() {

    selectedBox = null;

    const item = words[currentWordIndex];

    currentLetters = shuffleLetters(item.letters);

    $("wordNumber").textContent =
        currentWordIndex + 1;

    $("wordFeedback").textContent = "";

    $("wordFeedback").className = "feedback";

    $("checkWord").disabled = false;

    $("nextWord").disabled = true;

    $("currentWord").textContent = "؟";

    renderLetters();

}


/* نمایش کادرهای نشانه */

function renderLetters() {

    const container = $("letterBoxes");

    container.innerHTML = "";

    currentLetters.forEach((letter, index) => {

        const box = document.createElement("button");

        box.className = "letter-box";

        box.textContent = letter;

        box.dataset.index = index;

        box.addEventListener("click", () => {

            selectLetter(index);

        });

        container.appendChild(box);

    });

    updateCurrentWord();

}


/* انتخاب دو کادر و جابه‌جایی آن‌ها */

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


/* ساخت واژه از نشانه‌ها */

function updateCurrentWord() {

    $("currentWord").textContent =
        currentLetters.join("");

}


/* بررسی پاسخ */

$("checkWord").addEventListener("click", () => {

    const answer = currentLetters.join("");

    const correct = words[currentWordIndex].word;

    if (answer === correct) {

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

    } else {

        $("wordFeedback").textContent =
            "یک بار دیگر نشانه‌ها را مرتب کن. 🌷";

        $("wordFeedback").className =
            "feedback bad";

        playSound("bad");

    }

});


/* به‌روزرسانی پیشرفت */

function updateWordProgress() {

    $("wordScore").textContent =
        correctWords + " از ۱۵";

    $("wordProgressBar").style.width =
        (correctWords / 15 * 100) + "%";

}


/* واژه بعدی */

$("nextWord").addEventListener("click", () => {

    currentWordIndex++;

    if (currentWordIndex >= words.length) {

        finishGame();

        return;

    }

    loadWord();

});


/* پایان بازی */

function finishGame() {

    $("finishMessage").textContent =
        "آفرین " + student +
        "! تو جدول دوستی را کامل کردی و هر ۱۵ واژه را ساختی. 🌟";

    playSound("good");

    showScreen("finish");

}


/* شروع دوباره */

$("restartButton").addEventListener("click", () => {

    completedCells.clear();

    buildTable();

    $("equation").textContent =
        "برای شروع، یکی از خانه‌ها را انتخاب کن.";

    $("tableFeedback").textContent = "";

    $("finishTable").disabled = true;

    updateTableProgress();

    startWordGame();

    showScreen("menu");

});
