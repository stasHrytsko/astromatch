(function () {
  const ZODIAC_RANGES = [
    ["♈", "Овен", [3, 21], [4, 19]],
    ["♉", "Телец", [4, 20], [5, 20]],
    ["♊", "Близнецы", [5, 21], [6, 20]],
    ["♋", "Рак", [6, 21], [7, 22]],
    ["♌", "Лев", [7, 23], [8, 22]],
    ["♍", "Дева", [8, 23], [9, 22]],
    ["♎", "Весы", [9, 23], [10, 22]],
    ["♏", "Скорпион", [10, 23], [11, 21]],
    ["♐", "Стрелец", [11, 22], [12, 21]],
    ["♑", "Козерог", [12, 22], [1, 19]],
    ["♒", "Водолей", [1, 20], [2, 18]],
    ["♓", "Рыбы", [2, 19], [3, 20]],
  ];

  const ELEMENTS = {
    Огонь: ["♈", "♌", "♐"],
    Земля: ["♉", "♍", "♑"],
    Воздух: ["♊", "♎", "♒"],
    Вода: ["♋", "♏", "♓"],
  };

  const ELEMENT_DATA = {
    Огонь: {
      emoji: "🔥",
      role: "Драйвер / Инициатор",
      strength: "запускает, заряжает, толкает вперёд",
      risk: "перегорает и конкурирует за лидерство",
    },
    Земля: {
      emoji: "🌍",
      role: "Доводчик / Стабилизатор",
      strength: "доводит до результата и держит процессы",
      risk: "медленно стартует и сопротивляется переменам",
    },
    Воздух: {
      emoji: "💨",
      role: "Связной / Идеатор",
      strength: "несёт идеи, коммуникацию и связи",
      risk: "распыляется и избегает рутины",
    },
    Вода: {
      emoji: "💧",
      role: "Клей / Медиатор",
      strength: "считывает атмосферу и гасит конфликты",
      risk: "принимает близко к сердцу и уходит от прямого спора",
    },
  };

  const ASPECT_DATA = {
    0: { name: "Соединение", score: 72, phrase: "Быстро находите общий ритм, но усиливаете общие слабости." },
    1: { name: "Полусекстиль", score: 55, phrase: "Разный темп и язык, поэтому нужны явные договорённости." },
    2: { name: "Секстиль", score: 85, phrase: "Лучший рабочий тандем: хорошо дополняете друг друга." },
    3: { name: "Квадрат", score: 50, phrase: "Есть трение по умолчанию, зато и сильный потенциал роста." },
    4: { name: "Тригон", score: 90, phrase: "На одной волне и понимаете друг друга почти без слов." },
    5: { name: "Квинконс", score: 53, phrase: "Ритмы не совпадают, но это лечится договорённостями." },
    6: { name: "Оппозиция", score: 88, phrase: "Сильное взаимодополнение через контраст и притяжение." },
  };

  const TOTAL_LABELS = [
    { max: 54, emoji: "🧊", phrase: "Нужен явный процесс и договорённости." },
    { max: 69, emoji: "🌗", phrase: "Есть рабочая связка, но ритмы надо выравнивать." },
    { max: 84, emoji: "✨", phrase: "Хорошая рабочая совместимость и сильный потенциал." },
    { max: 100, emoji: "🚀", phrase: "Очень сильный тандем для совместной работы." },
  ];

  const TIP_BY_DISTANCE = {
    0: "Не делайте ставку на одинаковые привычки, закрепите зоны ответственности.",
    1: "Сразу договоритесь о формате коммуникации и сроках ответа.",
    2: "Используйте сильные стороны обоих: один стартует, другой дожимает.",
    3: "Разнесите роли, чтобы спор работал на качество, а не на хаос.",
    4: "Не замыкайтесь в эхо-камере, добавляйте внешнюю проверку идей.",
    5: "Зафиксируйте правила игры, иначе ритмы будут мешать результату.",
    6: "Разведите полюса по этапам: один толкает, другой стабилизирует.",
  };

  function indexForSign(sign) {
    return ZODIAC_RANGES.findIndex((item) => item[0] === sign);
  }

  function distanceBetweenSigns(sign1, sign2) {
    const firstIndex = indexForSign(sign1);
    const secondIndex = indexForSign(sign2);
    const rawDistance = Math.abs(firstIndex - secondIndex);
    return Math.min(rawDistance, 12 - rawDistance);
  }

  function getSign(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    for (const [symbol, , start, end] of ZODIAC_RANGES) {
      if ((month === start[0] && day >= start[1]) || (month === end[0] && day <= end[1])) {
        return symbol;
      }
    }

    return "♑";
  }

  function getSignName(sign) {
    const record = ZODIAC_RANGES.find((item) => item[0] === sign);
    return record ? record[1] : "Неизвестный знак";
  }

  function getElement(sign) {
    for (const [element, signs] of Object.entries(ELEMENTS)) {
      if (signs.includes(sign)) {
        return element;
      }
    }

    return null;
  }

  function getAspect(sign1, sign2) {
    const distance = distanceBetweenSigns(sign1, sign2);
    return { ...ASPECT_DATA[distance], distance };
  }

  function getElementCompatibility(element1, element2) {
    if (element1 === element2) {
      return 90;
    }

    const friendlyPairs = [
      new Set(["Огонь", "Воздух"]),
      new Set(["Земля", "Вода"]),
    ];

    if (friendlyPairs.some((pair) => pair.has(element1) && pair.has(element2))) {
      return 90;
    }

    return 55;
  }

  function getTotalLabel(total) {
    return TOTAL_LABELS.find((item) => total <= item.max) || TOTAL_LABELS[TOTAL_LABELS.length - 1];
  }

  function buildPerson(date, label) {
    const sign = getSign(date);
    const element = getElement(sign);
    const elementData = element ? ELEMENT_DATA[element] : null;

    return {
      label,
      sign,
      sign_name: getSignName(sign),
      element,
      element_emoji: elementData ? elementData.emoji : "",
      role_name: elementData ? elementData.role : "",
      role_strength: elementData ? elementData.strength : "",
      role_risk: elementData ? elementData.risk : "",
    };
  }

  function compute(date1, date2) {
    const person1 = buildPerson(date1, "Первый человек");
    const person2 = buildPerson(date2, "Второй человек");
    const aspect = getAspect(person1.sign, person2.sign);
    const elementsCompatibility = getElementCompatibility(person1.element, person2.element);
    const total = Math.round(aspect.score * 0.85 + elementsCompatibility * 0.15);
    const totalLabel = getTotalLabel(total);

    return {
      total,
      total_emoji: totalLabel.emoji,
      total_phrase: totalLabel.phrase,
      person1,
      person2,
      pair: {
        aspect_name: aspect.name,
        dynamic_phrase: aspect.phrase,
        friction: person1.element === person2.element
          ? "Похожий стиль усиливает друг друга, но может давать слепые зоны."
          : "Разные стили полезны, если явно разделить зоны влияния.",
        synergy: person1.element === person2.element
          ? `Оба в стихии ${person1.element.toLowerCase()}, поэтому легко понимаете темп друг друга.`
          : `${person1.element || "Первая стихия"} и ${person2.element || "Вторая стихия"} хорошо дополняют друг друга при чётком процессе.`,
        tip: TIP_BY_DISTANCE[aspect.distance] || "Сначала договоритесь о правилах, потом ускоряйтесь.",
      },
    };
  }

  window.TheMatch = {
    compute,
  };
})();