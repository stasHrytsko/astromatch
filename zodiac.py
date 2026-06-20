from datetime import datetime
from typing import Dict, Tuple, Optional


class ZodiacService:
    """Zodiac compatibility based on aspects (angular distance between signs).

    The only source of truth is the shortest distance between two signs on the
    zodiac wheel (0..6). Everything else is derived from it: sign compatibility,
    element compatibility, and the final score.

        0 - same sign (conjunction)                    -> medium
        1 - adjacent signs, different elements         -> friction
        2 - sextile, friendly elements                 -> high
        3 - square, conflicting elements              -> friction
        4 - trine, same element                       -> maximum
        5 - quincunx, different elements              -> friction
        6 - opposition, complementary elements        -> high
    """

    ELEMENTS_ICONS = {
        "Огонь": "🔥",
        "Земля": "🌍",
        "Воздух": "💨",
        "Вода": "💧",
    }

    ZODIAC_RANGES = [
        ("♈", "Овен",     (3, 21),  (4, 19)),
        ("♉", "Телец",    (4, 20),  (5, 20)),
        ("♊", "Близнецы", (5, 21),  (6, 20)),
        ("♋", "Рак",      (6, 21),  (7, 22)),
        ("♌", "Лев",      (7, 23),  (8, 22)),
        ("♍", "Дева",     (8, 23),  (9, 22)),
        ("♎", "Весы",     (9, 23),  (10, 22)),
        ("♏", "Скорпион", (10, 23), (11, 21)),
        ("♐", "Стрелец",  (11, 22), (12, 21)),
        ("♑", "Козерог",  (12, 22), (1, 19)),
        ("♒", "Водолей",  (1, 20),  (2, 18)),
        ("♓", "Рыбы",     (2, 19),  (3, 20)),
    ]

    ELEMENTS = {
        "Огонь":  ["♈", "♌", "♐"],
        "Земля":  ["♉", "♍", "♑"],
        "Воздух": ["♊", "♎", "♒"],
        "Вода":   ["♋", "♏", "♓"],
    }

    # SOURCE OF TRUTH: aspect score by sign distance on the zodiac wheel.
    ASPECT_SCORE = {0: 72, 1: 55, 2: 85, 3: 50, 4: 90, 5: 53, 6: 88}

    # ------------------------------------------------------------------ #
    # Internal helpers                                                    #
    # ------------------------------------------------------------------ #

    def _index(self, sign: str) -> int:
        """Ordinal sign index (0..11) by sign symbol."""
        return next(i for i, r in enumerate(self.ZODIAC_RANGES) if r[0] == sign)

    def _distance(self, sign1: str, sign2: str) -> int:
        """Shortest distance between two signs on the zodiac wheel (0..6)."""
        d = abs(self._index(sign1) - self._index(sign2))
        return min(d, 12 - d)

    # ------------------------------------------------------------------ #
    # Public calculation                                                  #
    # ------------------------------------------------------------------ #

    def calculate_zodiac_compatibility(
        self, date1: datetime, date2: datetime
    ) -> Tuple[float, Dict]:
        """Return (final percentage, details for rendering)."""
        sign1 = self.get_zodiac_sign(date1)
        sign2 = self.get_zodiac_sign(date2)

        element1 = self.get_element(sign1)
        element2 = self.get_element(sign2)

        signs_comp = self.get_signs_compatibility(sign1, sign2)
        elements_comp = self.get_elements_compatibility(element1, element2)

        # Elements are only a confirming nuance, not a second dominant factor.
        total_compatibility = round(signs_comp * 0.85 + elements_comp * 0.15, 1)

        details = {
            "sign1": sign1,
            "sign2": sign2,
            "element1": element1,
            "element2": element2,
            "signs_compatibility": round(signs_comp, 1),
            "elements_compatibility": round(elements_comp, 1),
        }
        return total_compatibility, details

    def get_signs_compatibility(self, sign1: str, sign2: str) -> float:
        """Compatibility between two signs equals the score of their aspect."""
        return float(self.ASPECT_SCORE[self._distance(sign1, sign2)])

    def get_elements_compatibility(self, element1: str, element2: str) -> float:
        """Coarse element compatibility for the UI side."""
        if element1 == element2:
            return 90
        friendly = ({"Огонь", "Воздух"}, {"Земля", "Вода"})
        if {element1, element2} in friendly:
            return 90
        return 55

    # ------------------------------------------------------------------ #
    # Lookup tables                                                       #
    # ------------------------------------------------------------------ #

    def get_element(self, sign: str) -> Optional[str]:
        """Element for a sign symbol."""
        for element, signs in self.ELEMENTS.items():
            if sign in signs:
                return element
        return None

    def get_zodiac_sign(self, date: datetime) -> Optional[str]:
        """Zodiac sign by date. Capricorn wraps across the year boundary."""
        month, day = date.month, date.day
        for symbol, _, start, end in self.ZODIAC_RANGES:
            if (month == start[0] and day >= start[1]) or \
               (month == end[0] and day <= end[1]):
                return symbol
        return None

    def get_sign_name(self, sign: str) -> str:
        """Russian name of the sign symbol."""
        return next((r[1] for r in self.ZODIAC_RANGES if r[0] == sign),
                    "Неизвестный знак")
from datetime import datetime
from typing import Dict, Tuple, Optional


class ZodiacService:
    """Зодиакальная совместимость на основе аспектов (угол между знаками).

    Единственный источник правды — расстояние между знаками по кругу (0..6).
    Из него выводится всё: и совместимость знаков, и отношение стихий.
    Хранимой матрицы 12×12 больше нет — поэтому асимметрия невозможна
    by design, а согласовывать руками нечего.

        0 — тот же знак (соединение)                              → средне
        1 — соседние, разные стихии (полусекстиль)               → трение
        2 — секстиль, дружественные стихии (Огонь-Воздух/Земля-Вода) → высоко
        3 — квадрат, конфликт стихий                             → трение
        4 — тригон, ОДНА стихия                                  → максимум
        5 — квинконс, разные стихии                              → трение
        6 — оппозиция, дополняющие стихии (притяжение)           → высоко
    """

    ELEMENTS_ICONS = {
        'Огонь': '🔥',
        'Земля': '🌍',
        'Воздух': '💨',
        'Вода': '💧',
    }

    ZODIAC_RANGES = [
        ('♈', 'Овен',     (3, 21),  (4, 19)),
        ('♉', 'Телец',    (4, 20),  (5, 20)),
        ('♊', 'Близнецы', (5, 21),  (6, 20)),
        ('♋', 'Рак',      (6, 21),  (7, 22)),
        ('♌', 'Лев',      (7, 23),  (8, 22)),
        ('♍', 'Дева',     (8, 23),  (9, 22)),
        ('♎', 'Весы',     (9, 23),  (10, 22)),
        ('♏', 'Скорпион', (10, 23), (11, 21)),
        ('♐', 'Стрелец',  (11, 22), (12, 21)),
        ('♑', 'Козерог',  (12, 22), (1, 19)),
        ('♒', 'Водолей',  (1, 20),  (2, 18)),
        ('♓', 'Рыбы',     (2, 19),  (3, 20)),
    ]

    ELEMENTS = {
        'Огонь':  ['♈', '♌', '♐'],
        'Земля':  ['♉', '♍', '♑'],
        'Воздух': ['♊', '♎', '♒'],
        'Вода':   ['♋', '♏', '♓'],
    }

    # ИСТОЧНИК ПРАВДЫ: балл по аспекту (расстоянию между знаками по кругу).
    # Симметричен и самодокументирован. Всё остальное выводится отсюда.
    ASPECT_SCORE = {0: 72, 1: 55, 2: 85, 3: 50, 4: 90, 5: 53, 6: 88}

    # ------------------------------------------------------------------ #
    # Внутренние помощники                                                #
    # ------------------------------------------------------------------ #

    def _index(self, sign: str) -> int:
        """Порядковый номер знака (0..11) по его символу."""
        return next(i for i, r in enumerate(self.ZODIAC_RANGES) if r[0] == sign)

    def _distance(self, sign1: str, sign2: str) -> int:
        """Кратчайшее расстояние между знаками по кругу (0..6)."""
        d = abs(self._index(sign1) - self._index(sign2))
        return min(d, 12 - d)

    # ------------------------------------------------------------------ #
    # Публичный расчёт                                                    #
    # ------------------------------------------------------------------ #

    def calculate_zodiac_compatibility(
        self, date1: datetime, date2: datetime
    ) -> Tuple[float, Dict]:
        """Общая зодиакальная совместимость двух дат.

        Returns: (итоговый процент, детали для рендера).
        """
        sign1 = self.get_zodiac_sign(date1)
        sign2 = self.get_zodiac_sign(date2)

        element1 = self.get_element(sign1)
        element2 = self.get_element(sign2)

        signs_comp = self.get_signs_compatibility(sign1, sign2)        # аспект — главное
        elements_comp = self.get_elements_compatibility(element1, element2)  # стихии — нюанс/UI

        # Стихии БОЛЬШЕ НЕ ДУБЛИРУЮТ знаки: аспект уже их содержит.
        # Поэтому у стихий лёгкий подтверждающий вес (15%), а не второй 60%.
        total_compatibility = round(signs_comp * 0.85 + elements_comp * 0.15, 1)

        details = {
            'sign1': sign1,
            'sign2': sign2,
            'element1': element1,
            'element2': element2,
            'signs_compatibility': round(signs_comp, 1),
            'elements_compatibility': round(elements_comp, 1),
        }
        return total_compatibility, details

    def get_signs_compatibility(self, sign1: str, sign2: str) -> float:
        """Совместимость двух знаков = балл их аспекта.

        Симметрична by design: зависит только от расстояния по кругу,
        поэтому compat(a, b) == compat(b, a) без всяких усреднений.
        """
        return float(self.ASPECT_SCORE[self._distance(sign1, sign2)])

    def get_elements_compatibility(self, element1: str, element2: str) -> float:
        """Грубая совместимость стихий — для отдельной секции в UI.

        Одна стихия (тригон) = 90: классически самая гармоничная связь.
        Дополняющие (Огонь-Воздух, Земля-Вода) = 90: идеальный баланс.
        Остальные комбинации = 55.
        """
        if element1 == element2:
            return 90
        friendly = ({'Огонь', 'Воздух'}, {'Земля', 'Вода'})
        if {element1, element2} in friendly:
            return 90
        return 55

    # ------------------------------------------------------------------ #
    # Справочники                                                         #
    # ------------------------------------------------------------------ #

    def get_element(self, sign: str) -> Optional[str]:
        """Стихия знака по его символу."""
        for element, signs in self.ELEMENTS.items():
            if sign in signs:
                return element
        return None

    def get_zodiac_sign(self, date: datetime) -> Optional[str]:
        """Знак зодиака по дате. Козерог (переход через год) ловится циклом."""
        month, day = date.month, date.day
        for symbol, _, start, end in self.ZODIAC_RANGES:
            if (month == start[0] and day >= start[1]) or \
               (month == end[0] and day <= end[1]):
                return symbol
        return None

    def get_sign_name(self, sign: str) -> str:
        """Русское название знака по символу."""
        return next((r[1] for r in self.ZODIAC_RANGES if r[0] == sign),
                    "Неизвестный знак")