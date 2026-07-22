
(() => {
  const questions = [
    {
      q: "Which number is irrational?",
      choices: ["0.75", "√2", "-4", "3/8"],
      answer: 1,
      why: "√2 cannot be written as a fraction of two integers."
    },
    {
      q: "What is the slope between (2, 3) and (6, 11)?",
      choices: ["2", "4", "1/2", "8"],
      answer: 0,
      why: "The rise is 8 and the run is 4, so the slope is 8 ÷ 4 = 2."
    },
    {
      q: "Which relation is a function?",
      choices: ["One input has two outputs", "Every input has exactly one output", "Two inputs share an output", "The graph is curved"],
      answer: 1,
      why: "A function assigns exactly one output to each input."
    },
    {
      q: "A right triangle has legs 6 and 8. What is the hypotenuse?",
      choices: ["10", "12", "14", "48"],
      answer: 0,
      why: "6² + 8² = 36 + 64 = 100, and √100 = 10."
    },
    {
      q: "Solve: 3x + 5 = 20",
      choices: ["x = 3", "x = 5", "x = 8", "x = 15"],
      answer: 1,
      why: "Subtract 5 to get 3x = 15, then divide by 3."
    },
    {
      q: "Which transformation changes a figure’s size?",
      choices: ["Translation", "Reflection", "Rotation", "Dilation"],
      answer: 3,
      why: "A dilation changes size using a scale factor."
    },
    {
      q: "Which equation has a slope of -3 and a y-intercept of 4?",
      choices: ["y = 4x - 3", "y = -3x + 4", "y = 3x - 4", "y = -4x + 3"],
      answer: 1,
      why: "In y = mx + b, m is the slope and b is the y-intercept."
    }
  ];

  const badges = [
    { xp: 10, icon: "🐾", name: "First Step" },
    { xp: 30, icon: "⭐", name: "Skill Builder" },
    { xp: 70, icon: "🏅", name: "Math Explorer" },
    { xp: 140, icon: "🏆", name: "Atlas Achiever" }
  ];

  const storageKey = "atlasBearsPhase2Progress";
  const todayKey = new Date().toISOString().slice(0, 10);
  const dayNumber = Math.floor(Date.now() / 86400000);
  const question = questions[dayNumber % questions.length];

  let progress;
  try {
    progress = JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    progress = {};
  }

  progress.xp = Number(progress.xp) || 0;
  progress.streak = Number(progress.streak) || 0;
  progress.longestStreak = Number(progress.longestStreak) || 0;
  progress.attempts = Number(progress.attempts) || 0;
  progress.correct = Number(progress.correct) || 0;
  progress.visits = Number(progress.visits) || 0;
  progress.lastVisit = progress.lastVisit || "";
  progress.lastCompleted = progress.lastCompleted || "";
  progress.completedDates = Array.isArray(progress.completedDates) ? progress.completedDates : [];
  progress.attemptedToday = progress.attemptedToday || {};

  // Count one visit per calendar day on this device.
  if (progress.lastVisit !== todayKey) {
    progress.visits += 1;
    progress.lastVisit = todayKey;
  }

  const qEl = document.getElementById("daily-question");
  const answersEl = document.getElementById("daily-answers");
  const feedbackEl = document.getElementById("daily-feedback");
  const xpEl = document.getElementById("xp-total");
  const visitEl = document.getElementById("visit-total");
  const correctEl = document.getElementById("correct-total");
  const attemptEl = document.getElementById("attempt-total");
  const accuracyEl = document.getElementById("accuracy-total");
  const streakEl = document.getElementById("streak-total");
  const longestStreakEl = document.getElementById("longest-streak-total");
  const completedEl = document.getElementById("completed-total");
  const xpFill = document.getElementById("xp-fill");
  const nextBadgeEl = document.getElementById("next-badge");
  const badgeList = document.getElementById("badge-list");
  const resetButton = document.getElementById("reset-progress");

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }

  function dateDiffDays(a, b) {
    const first = new Date(a + "T12:00:00");
    const second = new Date(b + "T12:00:00");
    return Math.round((second - first) / 86400000);
  }

  function renderProgress() {
    const accuracy = progress.attempts > 0
      ? Math.round((progress.correct / progress.attempts) * 100)
      : 0;

    xpEl.textContent = progress.xp;
    visitEl.textContent = progress.visits;
    correctEl.textContent = progress.correct;
    attemptEl.textContent = progress.attempts;
    accuracyEl.textContent = `${accuracy}%`;
    streakEl.textContent = progress.streak;
    longestStreakEl.textContent = progress.longestStreak;
    completedEl.textContent = progress.completedDates.length;

    badgeList.innerHTML = "";
    badges.filter(b => progress.xp >= b.xp).forEach(b => {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = `${b.icon} ${b.name}`;
      badgeList.appendChild(badge);
    });

    const next = badges.find(b => progress.xp < b.xp);
    if (next) {
      const previous = [...badges].reverse().find(b => progress.xp >= b.xp);
      const start = previous ? previous.xp : 0;
      const percent = Math.max(
        0,
        Math.min(100, ((progress.xp - start) / (next.xp - start)) * 100)
      );
      xpFill.style.width = `${percent}%`;
      nextBadgeEl.textContent = `${next.xp - progress.xp} more XP until ${next.icon} ${next.name}.`;
    } else {
      xpFill.style.width = "100%";
      nextBadgeEl.textContent = "All Phase 2 badges earned!";
    }
  }

  function lockQuestion(message) {
    answersEl.querySelectorAll("button").forEach((button, index) => {
      button.disabled = true;
      if (index === question.answer) button.classList.add("correct");
    });
    feedbackEl.textContent = message;
  }

  qEl.textContent = question.q;

  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = choice;

    button.addEventListener("click", () => {
      if (progress.completedDates.includes(todayKey)) return;

      progress.attempts += 1;
      progress.attemptedToday[todayKey] = (progress.attemptedToday[todayKey] || 0) + 1;

      if (index === question.answer) {
        button.classList.add("correct");
        progress.correct += 1;
        progress.xp += 10;

        if (progress.lastCompleted) {
          const gap = dateDiffDays(progress.lastCompleted, todayKey);
          progress.streak = gap === 1
            ? progress.streak + 1
            : (gap === 0 ? progress.streak : 1);
        } else {
          progress.streak = 1;
        }

        progress.longestStreak = Math.max(progress.longestStreak, progress.streak);
        progress.lastCompleted = todayKey;
        progress.completedDates.push(todayKey);

        save();
        lockQuestion(`Correct! +10 XP. ${question.why}`);
        renderProgress();
      } else {
        button.classList.add("incorrect");
        save();
        feedbackEl.textContent = "Not quite. Try another answer.";
        renderProgress();
      }
    });

    answersEl.appendChild(button);
  });

  if (progress.completedDates.includes(todayKey)) {
    lockQuestion(`Today’s challenge is complete. ${question.why}`);
  }

  resetButton.addEventListener("click", () => {
    const confirmed = window.confirm(
      "Reset all visits, attempts, accuracy, XP, streaks, and badges saved on this device?"
    );
    if (!confirmed) return;
    localStorage.removeItem(storageKey);
    window.location.reload();
  });

  save();
  renderProgress();
})();
