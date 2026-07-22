(() => {
  const sections = document.getElementById("strand-sections");
  const filter = document.getElementById("strand-filter");
  const search = document.getElementById("topic-search");
  const lessonView = document.getElementById("lesson-view");
  const noResults = document.getElementById("no-results");
  const storageKey = "atlasBearsReviewedTopics";
  let reviewed = [];
  try { reviewed = JSON.parse(localStorage.getItem(storageKey)) || []; } catch { reviewed = []; }
  let activeTopic = null;

  const strands = [...new Set(LEARNING_TOPICS.map(t => t.strand))];
  strands.forEach(strand => {
    const option = document.createElement("option");
    option.value = strand; option.textContent = strand; filter.appendChild(option);
  });

  function saveReviewed(){ localStorage.setItem(storageKey, JSON.stringify(reviewed)); updateProgress(); }
  function updateProgress(){
    document.getElementById("reviewed-count").textContent = reviewed.length;
    document.getElementById("learning-progress-fill").style.width = `${(reviewed.length/LEARNING_TOPICS.length)*100}%`;
  }

  function render(){
    const term = search.value.trim().toLowerCase();
    const selected = filter.value;
    const visible = LEARNING_TOPICS.filter(t =>
      (selected === "all" || t.strand === selected) &&
      (!term || `${t.title} ${t.summary} ${t.standard} ${t.strand}`.toLowerCase().includes(term))
    );
    sections.innerHTML = "";
    noResults.classList.toggle("hidden", visible.length > 0);
    strands.forEach(strand => {
      const topics = visible.filter(t => t.strand === strand);
      if (!topics.length) return;
      const section = document.createElement("section"); section.className = "strand-group";
      section.innerHTML = `<div class="strand-heading"><div><span class="strand-icon">${topics[0].icon}</span><h2>${strand}</h2></div><span>${topics.length} topic${topics.length===1?'':'s'}</span></div><div class="topic-grid"></div>`;
      const grid = section.querySelector(".topic-grid");
      topics.forEach(topic => {
        const done = reviewed.includes(topic.id);
        const card = document.createElement("article"); card.className = `topic-card${done?' reviewed':''}`;
        card.innerHTML = `<div class="topic-card-top"><span class="standard-tag">${topic.standard}</span><span class="review-status">${done?'✓ Reviewed':'Not reviewed'}</span></div><h3>${topic.title}</h3><p>${topic.summary}</p><button class="btn ${done?'secondary':'gold'}" type="button">${done?'Review Again':'Open Lesson'}</button>`;
        card.querySelector("button").addEventListener("click", () => openLesson(topic));
        grid.appendChild(card);
      });
      sections.appendChild(section);
    });
  }

  function openLesson(topic){
    activeTopic = topic;
    document.getElementById("lesson-strand").textContent = topic.strand.toUpperCase();
    document.getElementById("lesson-title").textContent = topic.title;
    document.getElementById("lesson-standard").textContent = topic.standard;
    document.getElementById("lesson-explanation").textContent = topic.explanation;
    document.getElementById("lesson-key-ideas").innerHTML = topic.ideas.map(i=>`<li>${i}</li>`).join("");
    document.getElementById("lesson-example-question").textContent = topic.example.q;
    document.getElementById("lesson-example-steps").innerHTML = `<ol>${topic.example.steps.map(s=>`<li>${s}</li>`).join("")}</ol>`;
    document.getElementById("lesson-example-answer").textContent = topic.example.a;
    document.getElementById("check-question").textContent = topic.check.q;
    const choices = document.getElementById("check-choices"); choices.innerHTML = "";
    document.getElementById("check-feedback").textContent = "";
    topic.check.choices.forEach((choice,index)=>{
      const button=document.createElement("button"); button.type="button"; button.textContent=choice;
      button.addEventListener("click",()=>{
        choices.querySelectorAll("button").forEach(b=>b.disabled=true);
        if(index===topic.check.answer){ button.classList.add("correct"); document.getElementById("check-feedback").textContent=`Correct! ${topic.check.why}`; }
        else { button.classList.add("incorrect"); choices.children[topic.check.answer].classList.add("correct"); document.getElementById("check-feedback").textContent=`The correct answer is ${topic.check.choices[topic.check.answer]}. ${topic.check.why}`; }
      });
      choices.appendChild(button);
    });
    const mark=document.getElementById("mark-reviewed");
    mark.textContent=reviewed.includes(topic.id)?"✓ Topic Reviewed":"Mark Topic Reviewed";
    lessonView.classList.remove("hidden");
    lessonView.scrollIntoView({behavior:"smooth",block:"start"});
  }

  document.getElementById("close-lesson").addEventListener("click",()=>lessonView.classList.add("hidden"));
  document.getElementById("mark-reviewed").addEventListener("click",()=>{
    if(!activeTopic) return;
    if(!reviewed.includes(activeTopic.id)){ reviewed.push(activeTopic.id); saveReviewed(); render(); }
    document.getElementById("mark-reviewed").textContent="✓ Topic Reviewed";
  });
  filter.addEventListener("change",render); search.addEventListener("input",render);
  updateProgress(); render();
})();
