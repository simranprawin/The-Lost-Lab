
const GAME_TIME = 8 * 60;

let timeLeft = GAME_TIME;
let timerInterval;
let inventory = [];
let clues = [];
let solved = {
    drawer: false,
    locker: false,
    exit: false
};
let gameEnded = false;
let hintIndex = 0;

const timerElement = document.getElementById("timer");
const timerCard = document.querySelector(".timer-card");
const backdrop = document.getElementById("modalBackdrop");
const modalIcon = document.getElementById("modalIcon");
const modalEyebrow = document.getElementById("modalEyebrow");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalExtra = document.getElementById("modalExtra");
const modalActions = document.getElementById("modalActions");
const toast = document.getElementById("toast");

const objectiveTitle = document.getElementById("objectiveTitle");
const objectiveText = document.getElementById("objectiveText");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const inventoryElement = document.getElementById("inventory");
const clueList = document.getElementById("clueList");
const sceneCaption = document.getElementById("sceneCaption");

const items = {
    uv: {
        name: "UV Flashlight",
        icon: "🔦"
    },
    keycard: {
        name: "Security Keycard",
        icon: "💳"
    }
};

const hints = [
    "The notebook contains a mathematical clue. Read it carefully.",
    "The notebook mentions pi. Think about its first three digits.",
    "The desk drawer requires a three-digit code.",
    "The UV flashlight is useful for finding invisible information.",
    "Try using the microscope after collecting the UV flashlight.",
    "The microscope reveals a code for the security locker.",
    "The security locker contains something important for the exit.",
    "You need the security keycard to unlock the exit terminal."
];

function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (gameEnded) return;

        timeLeft--;

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        timerElement.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        if (timeLeft <= 60) {
            timerCard.classList.add("urgent");
        }

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}

function openModal(icon, eyebrow, title, description, actions = []) {
    modalIcon.textContent = icon;
    modalEyebrow.textContent = eyebrow;
    modalTitle.textContent = title;
    modalDescription.textContent = description;

    modalExtra.innerHTML = "";
    modalActions.innerHTML = "";

    actions.forEach(action => {
        const button = document.createElement("button");
        button.className = `action-btn ${action.secondary ? "secondary" : ""}`;
        button.textContent = action.label;

        button.addEventListener("click", action.onClick);
        modalActions.appendChild(button);
    });

    backdrop.classList.remove("hidden");
}

function closeModal() {
    backdrop.classList.add("hidden");
}

document.getElementById("modalClose").addEventListener("click", closeModal);

backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop && !gameEnded) {
        closeModal();
    }
});

function addClue(text) {
    if (clues.includes(text)) return;

    clues.push(text);

    const empty = clueList.querySelector(".empty-clue");
    if (empty) empty.remove();

    const clue = document.createElement("div");
    clue.className = "clue-item";
    clue.textContent = "✦ " + text;

    clueList.appendChild(clue);
}

function addItem(itemKey) {
    if (inventory.includes(itemKey)) return;

    inventory.push(itemKey);
    updateInventory();
}

function updateInventory() {
    inventoryElement.innerHTML = "";

    if (inventory.length === 0) {
        inventoryElement.innerHTML =
            '<div class="empty-inventory">Your inventory is empty.</div>';
        return;
    }

    inventory.forEach(key => {
        const item = items[key];

        const element = document.createElement("div");
        element.className = "inventory-item";
        element.innerHTML = `<span>${item.icon}</span>${item.name}`;

        inventoryElement.appendChild(element);
    });
}

function updateProgress() {
    const completed = Object.values(solved).filter(Boolean).length;

    progressFill.style.width = `${(completed / 3) * 100}%`;
    progressLabel.textContent = `${completed} / 3 PUZZLES SOLVED`;

    if (!solved.drawer) {
        objectiveTitle.textContent = "Escape the laboratory";
        objectiveText.textContent =
            "Find a clue in the notebook. It may help you unlock the desk drawer.";
    } else if (!solved.locker) {
        objectiveTitle.textContent = "Find the keycard";
        objectiveText.textContent =
            "Use your UV flashlight to discover the security locker code.";
    } else if (!solved.exit) {
        objectiveTitle.textContent = "Unlock the exit";
        objectiveText.textContent =
            "You have the security keycard. Find the exit door and use it.";
    }
}

function investigateNotebook() {
    addClue("The notebook says: 'The circle holds the secret. Use the first three digits of pi.'");

    openModal(
        "📓",
        "OBJECT FOUND",
        "The Research Notebook",
        "Most of the pages are torn out. One handwritten note remains: \"The circle holds the secret. Use the first three digits of pi.\"",
        [{
            label: "Close notebook",
            secondary: true,
            onClick: closeModal
        }]
    );

    sceneCaption.textContent = "A handwritten mathematical clue has been discovered.";
}

function investigateDrawer() {
    if (solved.drawer) {
        openModal(
            "🗄️",
            "PUZZLE COMPLETED",
            "The drawer is empty",
            "You already collected the UV flashlight from this drawer.",
            [{ label: "Close", onClick: closeModal }]
        );
        return;
    }

    openModal(
        "🔢",
        "LOCKED OBJECT",
        "Desk Drawer",
        "A three-digit keypad protects the drawer. Enter the correct code to open it."
    );

    showPuzzleInput(
        "Enter three-digit code",
        "314",
        (answer) => {
            if (answer === "314") {
                solved.drawer = true;
                addItem("uv");

                addClue("The desk drawer contained a UV flashlight.");

                updateProgress();

                openModal(
                    "🔦",
                    "ITEM COLLECTED",
                    "UV Flashlight acquired!",
                    "You opened the desk drawer and found a UV flashlight. Something invisible may now become visible.",
                    [{ label: "Continue", onClick: closeModal }]
                );

                sceneCaption.textContent = "You found a UV flashlight in the desk drawer!";
                showToast("✦ UV flashlight added to inventory!");
            } else {
                showToast("Incorrect code. Think about the notebook clue.");
            }
        }
    );
}

function investigateMicroscope() {
    if (!inventory.includes("uv")) {
        openModal(
            "🔬",
            "OBJECT FOUND",
            "The Microscope",
            "There is something unusual beneath the lens, but it is too dark to see clearly. You may need a special light.",
            [{ label: "Close", onClick: closeModal }]
        );
        return;
    }

    if (clues.some(clue => clue.includes("locker code"))) {
        openModal(
            "🔬",
            "CLUE ALREADY FOUND",
            "Hidden markings",
            "You already discovered the hidden locker code using the UV flashlight.",
            [{ label: "Close", onClick: closeModal }]
        );
        return;
    }

    addClue("The microscope reveals a hidden locker code: 728.");

    openModal(
        "✨",
        "SECRET REVEALED",
        "Invisible markings discovered!",
        "You shine the UV flashlight through the microscope. Three glowing digits appear on the glass: 7 - 2 - 8. This must be the locker code.",
        [{ label: "Remember clue", onClick: closeModal }]
    );

    sceneCaption.textContent = "A secret code has appeared under the microscope!";
}

function investigateLocker() {
    if (solved.locker) {
        openModal(
            "🔐",
            "PUZZLE COMPLETED",
            "Security Locker",
            "The locker is open. You already collected the security keycard.",
            [{ label: "Close", onClick: closeModal }]
        );
        return;
    }

    openModal(
        "🔢",
        "SECURITY LOCKER",
        "Restricted storage",
        "A keypad blocks the locker. You need to discover its three-digit access code."
    );

    showPuzzleInput(
        "Enter locker code",
        "728",
        (answer) => {
            if (answer === "728") {
                solved.locker = true;
                addItem("keycard");

                addClue("The security locker contained an access keycard.");

                updateProgress();

                openModal(
                    "💳",
                    "ITEM COLLECTED",
                    "Security Keycard found!",
                    "The locker opens with a click. Inside, you find a security keycard. The exit terminal may accept it.",
                    [{ label: "Continue", onClick: closeModal }]
                );

                sceneCaption.textContent = "You found the security keycard!";
                showToast("✦ Security keycard added to inventory!");
            } else {
                showToast("Wrong code. Investigate the microscope.");
            }
        }
    );
}

function investigateExit() {
    if (solved.exit) return;

    if (!inventory.includes("keycard")) {
        openModal(
            "🚪",
            "ACCESS DENIED",
            "Exit door locked",
            "The security terminal flashes red. A valid security keycard is required to unlock the door.",
            [{ label: "Understood", onClick: closeModal }]
        );
        return;
    }

    openModal(
        "💳",
        "FINAL CHALLENGE",
        "Security terminal",
        "You found the security keycard. Would you like to use it to unlock the exit?",
        [{
            label: "Use keycard",
            onClick: () => {
                solved.exit = true;
                updateProgress();
                winGame();
            }
        }, {
            label: "Not yet",
            secondary: true,
            onClick: closeModal
        }]
    );
}

function showPuzzleInput(placeholder, correctAnswer, onCorrect) {
    modalExtra.innerHTML = `
        <input
            type="text"
            id="puzzleInput"
            class="puzzle-input"
            placeholder="${placeholder}"
            maxlength="3"
            inputmode="numeric"
            autocomplete="off"
            aria-label="${placeholder}"
        >
        <p class="puzzle-feedback" id="puzzleFeedback"></p>
    `;

    modalActions.innerHTML = "";

    const submitButton = document.createElement("button");
    submitButton.className = "action-btn";
    submitButton.textContent = "Unlock";

    submitButton.addEventListener("click", () => {
        const input = document.getElementById("puzzleInput");
        const feedback = document.getElementById("puzzleFeedback");
        const answer = input.value.trim();

        if (answer === correctAnswer) {
            onCorrect();
        } else {
            feedback.textContent = "That code is incorrect. Investigate the clues again.";
            input.value = "";
            input.focus();
        }
    });

    const cancelButton = document.createElement("button");
    cancelButton.className = "action-btn secondary";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", closeModal);

    modalActions.append(submitButton, cancelButton);

    const input = document.getElementById("puzzleInput");
    input.focus();

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            submitButton.click();
        }
    });
}

function showHint() {
    if (gameEnded) return;

    let hint;

    if (!solved.drawer && !clues.some(clue => clue.includes("circle"))) {
        hint = hints[0];
    } else if (!solved.drawer) {
        hint = hints[1];
    } else if (!solved.locker && !clues.some(clue => clue.includes("locker code"))) {
        hint = hints[3];
    } else if (!solved.locker) {
        hint = hints[5];
    } else {
        hint = hints[7];
    }

    openModal(
        "✦",
        "MISSION ASSISTANCE",
        "A little guidance...",
        hint,
        [{ label: "Got it", onClick: closeModal }]
    );

    hintIndex++;
}

function winGame() {
    gameEnded = true;
    clearInterval(timerInterval);

    const usedTime = GAME_TIME - timeLeft;
    const minutes = Math.floor(usedTime / 60);
    const seconds = usedTime % 60;

    modalIcon.textContent = "🏆";
    modalEyebrow.textContent = "MISSION ACCOMPLISHED";
    modalTitle.textContent = "You escaped!";
    modalDescription.textContent =
        `You solved all three puzzles and escaped the laboratory in ${minutes}m ${seconds}s. You're a brilliant investigator!`;

    modalExtra.innerHTML = `
        <div class="victory-screen">
            <p style="color:#65e0c3;margin-top:18px;font-size:13px">
                ✦ ALL OBJECTIVES COMPLETED ✦
            </p>
        </div>
    `;

    modalActions.innerHTML = "";

    const playAgain = document.createElement("button");
    playAgain.className = "action-btn";
    playAgain.textContent = "Play Again";
    playAgain.addEventListener("click", restartGame);

    modalActions.appendChild(playAgain);
    backdrop.classList.remove("hidden");

    sceneCaption.textContent = "The exit door opens. You have escaped the laboratory!";
    showToast("MISSION ACCOMPLISHED!");
}

function endGame() {
    if (gameEnded) return;

    gameEnded = true;
    clearInterval(timerInterval);

    openModal(
        "⏰",
        "TIME EXPIRED",
        "The laboratory is locked!",
        "You ran out of time before escaping. Don't give up — every clue brings you closer to freedom.",
        [{
            label: "Try again",
            onClick: restartGame
        }]
    );

    modalExtra.innerHTML = "";
    modalActions.innerHTML = "";

    const retryButton = document.createElement("button");
    retryButton.className = "action-btn";
    retryButton.textContent = "Restart mission";
    retryButton.addEventListener("click", restartGame);

    modalActions.appendChild(retryButton);
}

function restartGame() {
    timeLeft = GAME_TIME;
    inventory = [];
    clues = [];
    solved = {
        drawer: false,
        locker: false,
        exit: false
    };

    gameEnded = false;
    hintIndex = 0;

    timerCard.classList.remove("urgent");
    timerElement.textContent = "08:00";

    clueList.innerHTML =
        '<p class="empty-clue">No clues discovered yet.</p>';

    updateInventory();
    updateProgress();

    sceneCaption.textContent =
        "You wake up in a deserted research laboratory...";

    backdrop.classList.add("hidden");

    startTimer();
    showToast("New mission started!");
}

document.querySelectorAll(".scene-object").forEach(object => {
    object.addEventListener("click", () => {
        if (gameEnded) return;

        const selected = object.dataset.object;

        const actions = {
            notebook: investigateNotebook,
            drawer: investigateDrawer,
            microscope: investigateMicroscope,
            locker: investigateLocker,
            exit: investigateExit
        };

        if (actions[selected]) actions[selected]();
    });
});

document.getElementById("hintBtn").addEventListener("click", showHint);
document.getElementById("restartBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to restart your mission?")) {
        restartGame();
    }
});

updateInventory();
updateProgress();
startTimer();
