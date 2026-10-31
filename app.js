"use strict";
const examples = {
  group: {
    before:
      "“Help me write an email about my classmate Jordan Smith, student ID 12345678, who missed our meeting because of their medical treatment.”",
    after:
      "Help me write a respectful email about a group member who missed a meeting. Focus on rescheduling and dividing the remaining work.",
    reason:
      "The name, student ID, and health detail aren’t needed to write a respectful message. Keep the request focused on coordination, not the person’s private circumstances.",
  },
  resume: {
    before:
      "“Improve this résumé: Maya Chen, 42 Example Lane, apartment 3, maya@example.com. My references’ personal phone numbers are attached.”",
    after:
      "Help improve these fictional résumé bullet points for an entry-level engineering role: built a sensor prototype, documented test results, and coordinated a three-person project.",
    reason:
      "For wording feedback, share only the relevant bullet points. Remove contact details and information about references. Review the full file, including comments and metadata, before any upload.",
  },
  code: {
    before:
      "“Debug this internal customer export script. Here is the production API key: [fictional secret], plus real customer records from our database.”",
    after:
      "Help debug this simplified Python example using fictional records and a placeholder API key. The function returns an empty list when I expect two items.",
    reason:
      "Create a minimal example with made-up data. Never share live credentials. Internal code may still be confidential even after you remove a key; confirm permission and use approved tools.",
  },
  research: {
    before:
      "“Summarize these interview notes from the only graduate student in our lab who lives in Example Hall. I removed their name, but included their health history.”",
    after:
      "Suggest a general structure for summarizing interview themes. Use fictional examples and do not analyze any participant records.",
    reason:
      "Unique contextual details can identify someone without a name. Participant permission, the research protocol, and institutional approval govern whether real data can be used with an AI service.",
  },
};
let activeExample = "group";
const $ = (s) => document.querySelector(s);
function showExample(key) {
  activeExample = key;
  const e = examples[key];
  $("#before-text").textContent = e.before;
  $("#after-text").textContent = e.after;
  $("#example-reason").textContent = e.reason;
  $("#example-panel").setAttribute("aria-labelledby", "tab-" + key);
  document.querySelectorAll("[data-example]").forEach((b) => {
    let selected = b.dataset.example === key;
    b.setAttribute("aria-selected", String(selected));
    b.tabIndex = selected ? 0 : -1;
  });
  $("#copy-example").textContent = "Copy revised example ↗";
}
const tabs = [...document.querySelectorAll("[data-example]")];
tabs.forEach((b, i) => {
  b.addEventListener("click", () => showExample(b.dataset.example));
  b.addEventListener("keydown", (e) => {
    let n;
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = tabs.length - 1;
    if (n !== undefined) {
      e.preventDefault();
      tabs[n].focus();
      showExample(tabs[n].dataset.example);
    }
  });
});
showExample("group");
$("#copy-example").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(examples[activeExample].after);
    $("#copy-example").textContent = "Copied ✓";
    $("#copy-status").textContent = "Revised fictional example copied.";
  } catch {
    $("#copy-status").textContent =
      "Clipboard access is unavailable. Select and copy the revised example above.";
    $("#copy-example").textContent = "Select the example above to copy";
  }
});
const checks = [...document.querySelectorAll("#check-items input")];
function updateChecks() {
  const count = checks.filter((c) => c.checked).length;
  $("#check-count").textContent = `${count} of 5 reviewed`;
  $("#check-progress").value = count;
  $("#check-result").textContent =
    count === 5
      ? "Review complete. If any concern remains unresolved, don’t share yet. This checklist is a prompt for judgment, not a privacy guarantee."
      : count
        ? `${5 - count} more ${5 - count === 1 ? "question" : "questions"} to consider. Resolve uncertainties before sharing.`
        : "A useful pause starts with the first question.";
}
checks.forEach((c) => c.addEventListener("change", updateChecks));
$("#reset-checklist").addEventListener("click", () => {
  checks.forEach((c) => (c.checked = false));
  updateChecks();
});
$("#print-checklist").addEventListener("click", () => window.print());
const questions = [
  {
    title: "The group chat screenshot",
    text: "You want AI to summarize your project plans. The screenshot also includes a teammate’s phone number and a private comment about their health.",
    options: [
      "Upload the screenshot; it is only for a summary.",
      "Write a brief, non-identifying summary of the project tasks yourself, then ask for help organizing it.",
      "Cover the teammate’s name but leave everything else.",
    ],
    answer: 1,
    explanation:
      "Keep the project information you actually need. A screenshot can reveal unrelated private details, and hiding a name alone may not protect someone. Check whether sharing the remaining content is allowed.",
  },
  {
    title: "The “anonymous” interview",
    text: "A research transcript has no name, but mentions the participant’s unique job, department, and a medical condition. Can you upload it?",
    options: [
      "Yes. Removing the name makes it anonymous.",
      "Yes, if the AI service is free.",
      "Pause: the details may identify them. Check the research protocol and approved tools before sharing.",
    ],
    answer: 2,
    explanation:
      "Identity can emerge from combinations of details. Research permissions and institutional requirements still apply. For help with structure, use fictional material instead.",
  },
  {
    title: "The account setting",
    text: "Your AI account has a setting that limits model training on your content. What should you conclude?",
    options: [
      "The tool is now approved for every confidential document.",
      "That setting addresses one use of the data. I still need to check retention, access, permissions, and applicable policy.",
      "The service never stores anything I send.",
    ],
    answer: 1,
    explanation:
      "Training, storage, retention, and access are different questions. A single setting does not authorize disclosure or settle every privacy concern. Check the specific service and account terms.",
  },
];
let qi = 0,
  correct = 0;
function renderQuestion(focus = false) {
  const q = questions[qi];
  $("#question-number").textContent = `SITUATION 0${qi + 1} / 03`;
  $("#question-title").textContent = q.title;
  $("#question-text").textContent = q.text;
  $("#question-options").replaceChildren();
  $("#question-feedback").hidden = true;
  $("#next-question").hidden = true;
  q.options.forEach((option, i) => {
    let b = document.createElement("button");
    b.type = "button";
    b.textContent = option;
    b.addEventListener("click", () => {
      document.querySelectorAll("#question-options button").forEach((el, j) => {
        el.disabled = true;
        if (j === q.answer) el.classList.add("correct");
      });
      b.classList.add("selected");
      if (i === q.answer) correct++;
      $("#question-feedback").textContent =
        (i === q.answer
          ? "That’s the more protective choice. "
          : "Consider the more protective approach. ") + q.explanation;
      $("#question-feedback").hidden = false;
      $("#next-question").hidden = false;
      $("#next-question").textContent =
        qi === 2 ? "See your takeaways →" : "Next situation →";
    });
    $("#question-options").append(b);
  });
  if (focus) $("#question-title").focus();
}
$("#next-question").addEventListener("click", () => {
  if (qi < 2) {
    qi++;
    renderQuestion(true);
  } else if (qi === 2) {
    qi = 3;
    $("#question-number").textContent = "QUICK CHECK COMPLETE";
    $("#question-title").textContent = "Take the pause with you.";
    $("#question-text").textContent =
      `You selected the more protective option in ${correct} of 3 situations. This is a learning activity, not a measure of your character or proof of lasting behavior change.`;
    $("#question-options").replaceChildren();
    $("#question-feedback").textContent =
      "Keep only necessary context. Consider the other person’s permission. Check the specific tool and the rules that apply. When unsure, use a fictional example or ask the responsible person first.";
    $("#question-feedback").hidden = false;
    $("#next-question").textContent = "Try the situations again ↻";
    $("#question-title").focus();
  } else {
    qi = 0;
    correct = 0;
    renderQuestion(true);
  }
});
renderQuestion();
