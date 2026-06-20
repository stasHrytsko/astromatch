(function () {
  const form = document.getElementById("compat-form");
  const date1Input = document.getElementById("date-1");
  const date2Input = document.getElementById("date-2");
  const results = document.getElementById("results");
  const template = document.getElementById("result-template");
  const shareButton = document.getElementById("share-btn");
  let latestResult = null;

  function isoToDate(value) {
    return new Date(`${value}T12:00:00`);
  }

  function renderEmptyState(message) {
    results.innerHTML = `
      <article class="result-card empty-state">
        <div class="result-top">
          <div class="score-ring score-ring-empty">
            <div>
              <strong>--</strong>
              <span class="score-label">${message}</span>
            </div>
          </div>
          <div class="pair-stats">
            <p class="pair-title">Готово для расчёта</p>
            <p class="pair-phrase">Выберите две даты и нажмите «Смотреть».</p>
          </div>
        </div>
      </article>
    `;
  }

  function renderPerson(target, person) {
    target.innerHTML = `
      <strong>${person.label}</strong>
      <h3>${person.sign} ${person.sign_name}</h3>
      <p>${person.element_emoji} ${person.element} · ${person.role_name}</p>
    `;
    target.classList.add("people-card");
  }

  function renderResults(data) {
    latestResult = data;
    results.innerHTML = "";
    const fragment = template.content.cloneNode(true);

    fragment.querySelector(".score-value").textContent = `${data.total}%`;
    fragment.querySelector(".score-label").textContent = `${data.total_emoji} ${data.total_phrase}`;
    fragment.querySelector(".pair-title").textContent = `${data.pair.aspect_name} · работа`;
    fragment.querySelector(".pair-phrase").textContent = data.pair.dynamic_phrase;

    const peopleGrid = fragment.querySelector(".people-grid");
    const firstCard = document.createElement("div");
    const secondCard = document.createElement("div");
    renderPerson(firstCard, data.person1);
    renderPerson(secondCard, data.person2);
    peopleGrid.append(firstCard, secondCard);

    fragment.querySelector(".pair-dynamic").textContent = data.pair.dynamic_phrase;
    fragment.querySelector(".pair-friction").textContent = data.pair.friction;
    fragment.querySelector(".pair-synergy").textContent = data.pair.synergy;
    fragment.querySelector(".pair-tip").textContent = data.pair.tip;

    results.appendChild(fragment);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!date1Input.value || !date2Input.value) {
      renderEmptyState("Нужны обе даты");
      return;
    }

    const compatibility = window.TheMatch.compute(isoToDate(date1Input.value), isoToDate(date2Input.value));
    renderResults(compatibility);
  }

  function handleShare() {
    if (!latestResult) {
      return;
    }

    const text = `${latestResult.total}% · ${latestResult.pair.aspect_name} · ${latestResult.person1.sign_name} + ${latestResult.person2.sign_name}`;

    if (navigator.share) {
      navigator.share({ title: "TheMatch", text }).catch(() => {});
      return;
    }

    navigator.clipboard?.writeText(text).catch(() => {});
  }

  form.addEventListener("submit", handleSubmit);
  shareButton.addEventListener("click", handleShare);

  renderEmptyState("Здесь будет результат");

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();