(function () {
  class ZodiacService {
    constructor() {
      this.ELEMENTS_ICONS = {
        Огонь: "🔥",
        Земля: "🌍",
        Воздух: "💨",
        Вода: "💧",
      };

      this.ZODIAC_RANGES = [
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

      this.ELEMENTS = {
        Огонь: ["♈", "♌", "♐"],
        Земля: ["♉", "♍", "♑"],
        Воздух: ["♊", "♎", "♒"],
        Вода: ["♋", "♏", "♓"],
      };

      this.ASPECT_SCORE = { 0: 72, 1: 55, 2: 85, 3: 50, 4: 90, 5: 53, 6: 88 };
    }

    _index(sign) {
      return this.ZODIAC_RANGES.findIndex((item) => item[0] === sign);
    }

    _distance(sign1, sign2) {
      const distance = Math.abs(this._index(sign1) - this._index(sign2));
      return Math.min(distance, 12 - distance);
    }

    calculate_zodiac_compatibility(date1, date2) {
      const sign1 = this.get_zodiac_sign(date1);
      const sign2 = this.get_zodiac_sign(date2);

      const element1 = this.get_element(sign1);
      const element2 = this.get_element(sign2);

      const signs_comp = this.get_signs_compatibility(sign1, sign2);
      const elements_comp = this.get_elements_compatibility(element1, element2);
      const total_compatibility = Math.round(signs_comp * 0.85 + elements_comp * 0.15);

      return [total_compatibility, {
        sign1,
        sign2,
        element1,
        element2,
        signs_compatibility: Math.round(signs_comp),
        elements_compatibility: Math.round(elements_comp),
      }];
    }

    get_signs_compatibility(sign1, sign2) {
      return floatish(this.ASPECT_SCORE[this._distance(sign1, sign2)]);
    }

    get_elements_compatibility(element1, element2) {
      if (element1 === element2) {
        return 90;
      }

      const friendly = [
        new Set(["Огонь", "Воздух"]),
        new Set(["Земля", "Вода"]),
      ];

      if (friendly.some((pair) => pair.has(element1) && pair.has(element2))) {
        return 90;
      }

      return 55;
    }

    get_element(sign) {
      for (const [element, signs] of Object.entries(this.ELEMENTS)) {
        if (signs.includes(sign)) {
          return element;
        }
      }
      return null;
    }

    get_zodiac_sign(date) {
      const month = date.getMonth() + 1;
      const day = date.getDate();

      for (const [symbol, , start, end] of this.ZODIAC_RANGES) {
        if ((month === start[0] && day >= start[1]) || (month === end[0] && day <= end[1])) {
          return symbol;
        }
      }

      return "♑";
    }

    get_sign_name(sign) {
      return this.ZODIAC_RANGES.find((item) => item[0] === sign)?.[1] || "Неизвестный знак";
    }
  }

  function floatish(value) {
    return Number.parseFloat(String(value));
  }

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
    0: { name: "Соединение", score: 72, phrase: "Похожий темп, похожие привычки." },
    1: { name: "Полусекстиль", score: 55, phrase: "Нужны явные правила и короткие договорённости." },
    2: { name: "Секстиль", score: 85, phrase: "Хорошо дополняете друг друга." },
    3: { name: "Квадрат", score: 50, phrase: "Есть трение, зато есть рост." },
    4: { name: "Тригон", score: 90, phrase: "Очень ровный общий ритм." },
    5: { name: "Квинконс", score: 53, phrase: "Ритмы не совпадают, но это лечится." },
    6: { name: "Оппозиция", score: 88, phrase: "Сильное взаимодополнение." },
  };

  const TOTAL_LABELS = [
    { max: 54, emoji: "🧊", phrase: "Нужен явный процесс и договорённости." },
    { max: 69, emoji: "🌗", phrase: "Есть рабочая связка, но ритмы надо выравнивать." },
    { max: 84, emoji: "✨", phrase: "Хорошая рабочая совместимость и сильный потенциал." },
    { max: 100, emoji: "🚀", phrase: "Очень сильный тандем для совместной работы." },
  ];

  const TIP_BY_DISTANCE = {
    0: "Разведите зоны ответственности.",
    1: "Сразу фиксируйте правила.",
    2: "Один стартует, другой дожимает.",
    3: "Спор держите в рамках задачи.",
    4: "Не замыкайтесь в эхо-камере.",
    5: "Коротко договоритесь о ритме.",
    6: "Разведите полюса по этапам.",
  };

  function getTotalLabel(total) {
    return TOTAL_LABELS.find((item) => total <= item.max) || TOTAL_LABELS[TOTAL_LABELS.length - 1];
  }

  function buildPerson(service, date, label) {
    const sign = service.get_zodiac_sign(date);
    const element = service.get_element(sign);
    const elementData = element ? ELEMENT_DATA[element] : null;

    return {
      label,
      sign,
      sign_name: service.get_sign_name(sign),
      element,
      element_emoji: elementData ? elementData.emoji : "",
      role_name: elementData ? elementData.role : "",
      role_strength: elementData ? elementData.strength : "",
      role_risk: elementData ? elementData.risk : "",
    };
  }

  function compute(date1, date2) {
    const service = new ZodiacService();
    const [total, details] = service.calculate_zodiac_compatibility(date1, date2);
    const person1 = buildPerson(service, date1, "Первый человек");
    const person2 = buildPerson(service, date2, "Второй человек");
    const aspect = ASPECT_DATA[service._distance(details.sign1, details.sign2)];
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
        friction: details.element1 === details.element2
          ? "Похожий стиль усиливает друг друга, но даёт слепые зоны."
          : "Разные стили полезны, если разделить зоны влияния.",
        synergy: details.element1 === details.element2
          ? `Оба в стихии ${details.element1.toLowerCase()}.`
          : `${details.element1 || "Первая стихия"} + ${details.element2 || "Вторая стихия"} = дополняющая связка.`,
        tip: TIP_BY_DISTANCE[service._distance(details.sign1, details.sign2)] || "Сначала договоритесь о правилах.",
      },
    };
  }

  window.TheMatch = {
    compute,
  };
})();