import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import loaderAnimation from "@/assets/gennio_loader.json";

const MESSAGES: string[] = [
  "Нейросеть вдохновляется вашим запросом...",
  "Подбираем нужные пиксели — как художник цвета на палитре.",
  "Генерируем — чтобы получилось именно так, как вы задумали.",
  "Алгоритмы шепчутся между собой... скоро будет результат.",
  "Обрабатываем идеи, превращая их в изображение.",
  "Составляем картинку из миллиардов вероятностей.",
  "Нейросеть смотрится в поток данных и ищет отражение вашей задумки.",
  "Смешиваем цвета реальности и воображения...",
  "Передаём запрос во вселенную нейронов...",
  "Формируем образ из чистой мысли и немного математики.",
  "Нейросеть настраивается на ваш запрос…",
  "Переплетаем данные и воображение…",
  "Из шумов рождается изображение…",
  "Выстраиваем форму и композицию кадра…",
  "Скрепляем фрагменты в цельную картинку…",
  "Из абстракции постепенно проявляется образ…",
  "Пересчитываем мир в координаты пикселей…",
  "Связываем вашу идею с моделью…",
  "Настраиваем баланс деталей и мягкости…",
  "Уточняем линии, свет и текстуры…",
  "Модель перебирает варианты и выбирает лучший…",
  "Собираем изображение нитка за ниткой…",
  "Добавляем глубину свету и теням…",
  "Строим изображение слой за слоем…",
  "Пропускаем запрос через несколько этапов обработки…",
  "Формируем композицию будущего изображения…",
  "Настраиваем контраст, свет и цвет…",
  "Добавляем мелкие детали и фактуру…",
  "Сопоставляем ваш запрос с опытом модели…",
  "Выравниваем контуры, чтобы картинка выглядела аккуратнее…",
  "Оцениваем несколько вариантов и выбираем самый удачный…",
  "Строим глубину сцены по слоям…",
  "Это займёт немного времени — модель всё ещё считает…",
  "Уточняем направление света и перспективу…",
  "Применяем выбранные параметры генерации…",
];

function getRandomIndex(prevIndex?: number): number {
  if (MESSAGES.length === 1) return 0;

  // первый вызов — просто рандом
  if (prevIndex === undefined) {
    return Math.floor(Math.random() * MESSAGES.length);
  }

  // последующие — рандом, но не тот же самый
  let idx = prevIndex;
  while (idx === prevIndex) {
    idx = Math.floor(Math.random() * MESSAGES.length);
  }
  return idx;
}

export default function GennioGenerationLoader() {
  const [messageIndex, setMessageIndex] = useState<number>(() =>
    getRandomIndex()
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((prev) => getRandomIndex(prev));
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  const message = MESSAGES[messageIndex];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <Lottie animationData={loaderAnimation} loop={true} />
      <p className="max-w-xl text-xl text-base-content/80">{message}</p>
    </div>
  );
}
