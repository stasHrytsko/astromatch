(function () {
  const form = document.getElementById("compat-form");
  const date1Input = document.getElementById("date-1");
  const date2Input = document.getElementById("date-2");
  const results = document.getElementById("results");
  const template = document.getElementById("result-template");

  function isoToDate(value) {
    return new Date(`${value}T12:00:00`);
  }

  function renderPerson(target, person) {
    target.innerHTML = `
      <strong>${person.label}</strong>
      <h3>${person.sign} ${person.sign_name}</h3>
      <p>${person.element_emoji} ${person.element}</p>
      <p><strong>Роль:</strong> ${person.role_name}</p>
      <p><strong>Сила:</strong> ${person.role_strength}</p>
      <p><strong>Риск:</strong> ${person.role_risk}</p>
    `;
    target.classList.add("people-card");
  }

  function renderResults(data) {
    results.innerHTML = "";
    const fragment = template.content.cloneNode(true);

    fragment.querySelector(".score-value").textContent = `${data.total}%`;
    fragment.querySelector(".score-label").textContent = `${data.total_emoji} ${data.total_phrase}`;
    fragment.querySelector(".pair-title").textContent = `${data.pair.aspect_name} · рабочая динамика пары`;
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
      results.innerHTML = "<p class='card form-card'>Выберите обе даты.</p>";
      return;
    }

    const compatibility = window.TheMatch.compute(isoToDate(date1Input.value), isoToDate(date2Input.value));
    renderResults(compatibility);
  }

  form.addEventListener("submit", handleSubmit);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();