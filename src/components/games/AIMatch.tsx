'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, RotateCcw, Brain, Clock, Trophy, Zap,
  CheckCircle2, XCircle,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { SUBJECTS } from '@/lib/constants';

// ---------- Types ----------

type GamePhase = 'select' | 'playing' | 'result';

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}

// ---------- Question Banks ----------

interface QuestionBank {
  [subjectId: string]: Question[];
}

const QUESTION_BANKS: QuestionBank = {
  mat: [
    { text: '\u222B2x dx = ?', options: ['x\u00B2', '2x\u00B2', 'x\u00B2+C', '2x'], correctIndex: 2 },
    { text: 'Bir \u00FC\u00E7genin i\u00E7 a\u00E7\u0131lar\u0131 toplam\u0131 ka\u00E7 derecedir?', options: ['90', '180', '270', '360'], correctIndex: 1 },
    { text: "f(x) = 3x + 5 fonksiyonunun e\u011Fimi ka\u00E7t\u0131r?", options: ['3', '5', '8', '15'], correctIndex: 0 },
    { text: '2\u2075 ka\u00E7t\u0131r?', options: ['10', '25', '32', '64'], correctIndex: 2 },
    { text: 'Bir dairenin alan form\u00FCl\u00FC nedir?', options: ['\u03C0r', '2\u03C0r', '\u03C0r\u00B2', '2\u03C0r\u00B2'], correctIndex: 2 },
    { text: 'Hangi say\u0131 asal de\u011Fildir?', options: ['2', '3', '5', '9'], correctIndex: 3 },
    { text: 'log\u2082(8) ka\u00E7t\u0131r?', options: ['2', '3', '4', '8'], correctIndex: 1 },
    { text: 'Bir dik \u00FC\u00E7gende hipoten\u00FCs en uzun kenard\u0131r. Do\u011Fru mu?', options: ['Do\u011Fru', 'Yanl\u0131\u015F', 'Emin de\u011Filim', 'Bazen'], correctIndex: 0 },
    { text: "Bir kutuda 4 k\u0131rm\u0131z\u0131, 3 mavi top var. Rastgele \u00E7ekilen topun mavi olma olas\u0131l\u0131\u011F\u0131 nedir?", options: ['1/7', '3/7', '4/7', '1/3'], correctIndex: 1 },
    { text: "x\u00B2 - 9 = 0 denkleminin \u00E7\u00F6z\u00FCm k\u00FCmesi nedir?", options: ['{3}', '{-3, 3}', '{9}', '{-9, 9}'], correctIndex: 1 },
    { text: 'A k\u00FCmesi {1,2,3} ise alt k\u00FCme say\u0131s\u0131 ka\u00E7t\u0131r?', options: ['3', '6', '8', '9'], correctIndex: 2 },
    { text: '\u221A169 ka\u00E7t\u0131r?', options: ['11', '12', '13', '14'], correctIndex: 2 },
    { text: 'Karma\u015F\u0131k say\u0131larda i\u00B2 ka\u00E7t\u0131r?', options: ['1', '-1', 'i', '-i'], correctIndex: 1 },
    { text: 'Bir fonksiyonun tersi varsa hangi \u015Fart sa\u011Flanmal\u0131d\u0131r?', options: ['Birebir', '\u00D6rten', 'Birebir ve \u00F6rten', 'S\u00FCrekli'], correctIndex: 2 },
    { text: 'Ard\u0131\u015F\u0131k iki say\u0131n\u0131n toplam\u0131 37 ise k\u00FC\u00E7\u00FCk say\u0131 ka\u00E7t\u0131r?', options: ['17', '18', '19', '20'], correctIndex: 1 },
  ],
  fiz: [
    { text: 'F = m \u00D7 a form\u00FCl\u00FCnde a neyi ifade eder?', options: ['H\u0131z', '\u0130vme', 'Kuvvet', 'K\u00FCtle'], correctIndex: 1 },
    { text: 'I\u015F\u0131\u011F\u0131n bo\u015Fluktaki h\u0131z\u0131 yakla\u015F\u0131k ka\u00E7 km/s?', options: ['300.000', '150.000', '500.000', '1.000.000'], correctIndex: 0 },
    { text: 'Ohm Kanunu hangi form\u00FClle ifade edilir?', options: ['V = I\u00B7R', 'F = m\u00B7a', 'E = m\u00B7c\u00B2', 'P = W/t'], correctIndex: 0 },
    { text: 'Birimi Newton olan b\u00FCy\u00FCl\u00FCk hangisidir?', options: ['Enerji', 'Kuvvet', '\u0130\u015F', 'G\u00FC\u00E7'], correctIndex: 1 },
    { text: 'Ses bo\u015Flukta yay\u0131labilir mi?', options: ['Evet', 'Hay\u0131r', 'Bazen', 'Sadece y\u00FCksek frekansta'], correctIndex: 1 },
    { text: 'D\u00FCnya\u2019n\u0131n \u00E7ekim ivmesi yakla\u015F\u0131k ka\u00E7 m/s\u00B2?', options: ['7,8', '9,8', '11,2', '15,6'], correctIndex: 1 },
    { text: 'Elektrik ak\u0131m\u0131n\u0131n birimi nedir?', options: ['Volt', 'Amper', 'Ohm', 'Watt'], correctIndex: 1 },
    { text: 'Bir cismin momentumu hangi de\u011Fi\u015Fkene ba\u011Fl\u0131 de\u011Fildir?', options: ['K\u00FCtle', 'H\u0131z', 'S\u0131cakl\u0131k', 'Y\u00F6n'], correctIndex: 2 },
    { text: 'Fotoelektrik olay\u0131n\u0131 a\u00E7\u0131klayan bilim insan\u0131 kimdir?', options: ['Newton', 'Einstein', 'Faraday', 'Maxwell'], correctIndex: 1 },
    { text: 'S\u00FCperiletkenlerde diren\u00E7 ka\u00E7t\u0131r?', options: ['Sonsuz', '\u00C7ok b\u00FCy\u00FCk', 'S\u0131f\u0131r', 'Negatif'], correctIndex: 2 },
    { text: 'Kald\u0131rma kuvvetini kim bulmu\u015Ftur?', options: ['Ar\u015Fimet', 'Newton', 'Galileo', 'Pascal'], correctIndex: 0 },
    { text: 'Bir transformat\u00F6r hangi prensiple \u00E7al\u0131\u015F\u0131r?', options: ['Elektroliz', 'Termal iletim', 'Elektromanyetik ind\u00FCksiyon', 'Fotoelektrik etki'], correctIndex: 2 },
    { text: 'SI birim sisteminde uzunluk birimi nedir?', options: ['Santimetre', 'Metre', 'Kilometre', 'Mil'], correctIndex: 1 },
    { text: 'Maxwell denklemleri ka\u00E7 tanedir?', options: ['2', '3', '4', '5'], correctIndex: 2 },
    { text: 'Bir atom \u00E7ekirde\u011Finde hangi par\u00E7ac\u0131klar bulunur?', options: ['Proton ve elektron', 'Proton ve n\u00F6tron', 'N\u00F6tron ve elektron', 'Sadece proton'], correctIndex: 1 },
  ],
  kim: [
    { text: 'H\u2082O molek\u00FCl\u00FCn\u00FCn i\u00E7inde ka\u00E7 oksijen atomu vard\u0131r?', options: ['1', '2', '3', '0'], correctIndex: 0 },
    { text: 'Periyodik tabloda ilk element hangisidir?', options: ['Helyum', 'Hidrojen', 'Lityum', 'Karbon'], correctIndex: 1 },
    { text: 'Asitlerin pH de\u011Feri ka\u00E7t\u0131r?', options: ['pH > 7', 'pH = 7', 'pH < 7', 'pH = 0'], correctIndex: 2 },
    { text: 'Tuzun form\u00FCl\u00FC nedir?', options: ['HCl', 'NaCl', 'NaOH', 'H\u2082SO\u2084'], correctIndex: 1 },
    { text: 'Hangi element s\u0131v\u0131 haldedir?', options: ['Demir', 'Alt\u0131n', 'C\u0131va', 'G\u00FCm\u00FC\u015F'], correctIndex: 2 },
    { text: 'Kimyasal ba\u011F t\u00FCrlerinden hangisi en g\u00FC\u00E7l\u00FCd\u00FCr?', options: ['\u0130yonik', 'Kovalent', 'Metalik', 'Hidrojen'], correctIndex: 1 },
    { text: 'CO\u2082 bile\u015Fi\u011Finin ad\u0131 nedir?', options: ['Karbon monoksit', 'Karbon dioksit', 'Karbonat', 'Karb\u00FCr'], correctIndex: 1 },
    { text: 'Avogadro say\u0131s\u0131 ka\u00E7t\u0131r?', options: ['6,02\u00D710\u00B2\u00B3', '6,02\u00D710\u00B2\u2074', '6,02\u00D710\u00B2\u00B2', '6,02\u00D710\u00B2\u2075'], correctIndex: 0 },
    { text: 'Oksidasyon say\u0131s\u0131 de\u011Fi\u015Fen tepkimelere ne denir?', options: ['Asit-baz', '\u00C7\u00F6kme', 'Redoks', 'N\u00F6trle\u015Fme'], correctIndex: 2 },
    { text: 'Mol kavram\u0131 ka\u00E7 gram i\u00E7in kullan\u0131l\u0131r?', options: ['1 gram', '12 gram', 'Atom k\u00FCtlesi kadar gram', '100 gram'], correctIndex: 2 },
    { text: 'Hangi gaz soygazd\u0131r?', options: ['Oksijen', 'Azot', 'Neon', 'Klor'], correctIndex: 2 },
    { text: 'CH\u2084 bile\u015Fi\u011Finin ad\u0131 nedir?', options: ['Etan', 'Metan', 'Propan', 'B\u00FCtan'], correctIndex: 1 },
    { text: 'Bir bile\u015Fi\u011Fin en k\u00FC\u00E7\u00FCk yap\u0131 ta\u015F\u0131na ne denir?', options: ['Atom', 'Molek\u00FCl', '\u0130yon', 'Element'], correctIndex: 1 },
    { text: 'Kataliz\u00F6r bir tepkimenin neyini de\u011Fi\u015Ftirir?', options: ['\u00DCr\u00FCn', 'Aktivasyon enerjisi', 'Is\u0131', 'K\u00FCtle'], correctIndex: 1 },
    { text: 'HCI + NaOH \u2192 NaCl + H\u2082O tepkimesi hangi t\u00FCrdendir?', options: ['Analiz', 'Sentez', 'N\u00F6trle\u015Fme', 'Redoks'], correctIndex: 2 },
  ],
  bio: [
    { text: '\u0130nsan v\u00FCcudunda ka\u00E7 kromozom vard\u0131r?', options: ['23', '46', '44', '24'], correctIndex: 1 },
    { text: 'Fotosentez hangi organelde ger\u00E7ekle\u015Fir?', options: ['Mitokondri', 'Kloroplast', 'Ribozom', 'Endoplazmik retikulum'], correctIndex: 1 },
    { text: 'H\u00FCcrenin enerji \u00FCreticisi hangi organeldir?', options: ['Kloroplast', 'Golgi', 'Mitokondri', '\u00C7ekirdek'], correctIndex: 2 },
    { text: 'Kan\u0131n pH de\u011Feri yakla\u015F\u0131k ka\u00E7t\u0131r?', options: ['5,4', '6,8', '7,4', '8,2'], correctIndex: 2 },
    { text: 'DNA\u2019n\u0131n yap\u0131s\u0131n\u0131 kim ke\u015Ffetmi\u015Ftir?', options: ['Darwin', 'Mendel', 'Watson ve Crick', 'Pasteur'], correctIndex: 2 },
    { text: '\u0130nsan v\u00FCcudundaki en b\u00FCy\u00FCk organ hangisidir?', options: ['Karaci\u011Fer', 'Akci\u011Fer', 'Deri', 'Beyin'], correctIndex: 2 },
    { text: 'Canl\u0131lar\u0131n temel yap\u0131 birimi nedir?', options: ['Atom', 'Molek\u00FCl', 'Doku', 'H\u00FCcre'], correctIndex: 3 },
    { text: 'Hormonlar\u0131 \u00FCreten sistem hangisidir?', options: ['Sinir sistemi', 'Endokrin sistem', 'Dola\u015F\u0131m sistemi', 'Solunum sistemi'], correctIndex: 1 },
    { text: 'Kan gruplar\u0131n\u0131 kim ke\u015Ffetmi\u015Ftir?', options: ['Mendel', 'Landsteiner', 'Darwin', 'Koch'], correctIndex: 1 },
    { text: 'DNA\u2019da hangi baz bulunmaz?', options: ['Adenin', 'Timin', 'Urasil', 'Guanin'], correctIndex: 2 },
    { text: 'Kalbin ka\u00E7 odas\u0131 vard\u0131r?', options: ['2', '3', '4', '5'], correctIndex: 2 },
    { text: 'Reflekslerin kontrol merkezi neresidir?', options: ['Omurilik', 'Beyin', 'Beyincik', 'Hipotalamus'], correctIndex: 0 },
    { text: 'Hangi vitamin C vitamini olarak bilinir?', options: ['A', 'B', 'C', 'D'], correctIndex: 2 },
    { text: 'B\u00F6breklerin g\u00F6revi nedir?', options: ['Solunum', 'Sindirim', 'Kan\u0131 s\u00FCzme', 'Hormon \u00FCretimi'], correctIndex: 2 },
    { text: 'A\u015F\u0131lar hangi ba\u011F\u0131\u015F\u0131kl\u0131k t\u00FCr\u00FCn\u00FC sa\u011Flar?', options: ['Do\u011Fal', 'Aktif yapay', 'Pasif', 'Do\u011Fu\u015Ftan'], correctIndex: 1 },
  ],
  edb: [
    { text: '\u015Eiirdeki son dizeye ne ad verilir?', options: ['Beyit', 'K\u0131ta', 'Dize', 'M\u0131sra'], correctIndex: 3 },
    { text: 'Hangi yazar "K\u00FC\u00E7\u00FCk Prens" eserini yazm\u0131\u015Ft\u0131r?', options: ['Balzac', 'Saint-Exup\u00E9ry', 'Camus', 'Hugo'], correctIndex: 1 },
    { text: 'Tanzimat edebiyat\u0131 hangi y\u00FCzy\u0131lda ba\u015Flam\u0131\u015Ft\u0131r?', options: ['17.', '18.', '19.', '20.'], correctIndex: 2 },
    { text: 'Destan t\u00FCr\u00FCn\u00FCn en \u00F6nemli \u00F6zelli\u011Fi nedir?', options: ['Ger\u00E7ek\u00E7i olmas\u0131', 'Ola\u011Fan\u00FCst\u00FC \u00F6\u011Feler i\u00E7ermesi', 'K\u0131sa olmas\u0131', 'D\u00FCzyaz\u0131yla yaz\u0131lmas\u0131'], correctIndex: 1 },
    { text: 'Naz\u0131m birimi "beyit" olan naz\u0131m \u015Fekli hangisidir?', options: ['Ko\u015Fma', 'Gazel', 'Destan', 'Semai'], correctIndex: 1 },
    { text: "H\u00FCseyin Nihal Ats\u0131z'\u0131n \u00FCnl\u00FC eseri hangisidir?", options: ['Bozkurtlar', 'Yaban', 'Ate\u015Ften G\u00F6mlek', 'Sinekli Bakkal'], correctIndex: 0 },
    { text: "'Sana d\u00FCn bir tepeden bakt\u0131m aziz \u0130stanbul' dizesi hangi \u015Fiirdendir?", options: ['\u0130stanbul T\u00FCrk\u00FCs\u00FC', 'S\u00FCleymaniye', 'Bursa\u2019da Zaman', 'Han Duvarlar\u0131'], correctIndex: 0 },
    { text: 'Servet-i F\u00FCnun dergisini kim \u00E7\u0131karm\u0131\u015Ft\u0131r?', options: ['Nam\u0131k Kemal', 'Tevfik Fikret', 'Recaizade Mahmut Ekrem', 'Cenap \u015Eahabettin'], correctIndex: 2 },
    { text: 'Anonim halk edebiyat\u0131 \u00FCr\u00FCnlerinden de\u011Fildir?', options: ['Maniler', 'Ninniler', 'A\u011F\u0131tlar', 'Gazeller'], correctIndex: 3 },
    { text: 'Halk hikayelerinin en \u00F6nemli \u00F6zelli\u011Fi nedir?', options: ['Yazar\u0131 bellidir', 'Anonimdir', 'D\u00FCzyaz\u0131d\u0131r', 'Modern teknikler kullan\u0131r'], correctIndex: 1 },
    { text: 'Re\u015Fat Nuri G\u00FCntekin\u2019in en \u00FCnl\u00FC eseri hangisidir?', options: ['Yaprak D\u00F6k\u00FCm\u00FC', '\u00C7al\u0131ku\u015Fu', 'Dokuzuncu Hariciye Ko\u011Fu\u015Fu', 'Sinekli Bakkal'], correctIndex: 1 },
    { text: 'Roman t\u00FCr\u00FC T\u00FCrk edebiyat\u0131na hangi d\u00F6nemde girmi\u015Ftir?', options: ['Divan edebiyat\u0131', 'Halk edebiyat\u0131', 'Tanzimat', 'Cumhuriyet'], correctIndex: 2 },
    { text: 'S\u00F6zl\u00FC edebiyat d\u00F6nemi \u00FCr\u00FCnlerinden de\u011Fildir?', options: ['Sav', 'Sagu', 'Ko\u015Fuk', 'Gazavatname'], correctIndex: 3 },
    { text: 'Mesnevi naz\u0131m \u015Fekli hangi \u015Fairle \u00F6zde\u015Fle\u015Fmi\u015Ftir?', options: ['Fuzuli', 'Baki', 'Mevlana', 'Nedim'], correctIndex: 2 },
    { text: 'Edebiyatta "teşbih" ne demektir?', options: ['Abartma', 'Benzetme', 'Kar\u015F\u0131la\u015Ft\u0131rma', 'Somutla\u015Ft\u0131rma'], correctIndex: 1 },
  ],
};

// ---------- AI Answer Logic ----------

function aiAnswer(question: Question): number {
  // AI is correct 70-90% of the time
  const accuracy = 0.7 + Math.random() * 0.2;
  if (Math.random() < accuracy) {
    return question.correctIndex;
  }
  // Pick a random wrong answer
  const wrongOptions = question.options
    .map((_, i) => i)
    .filter((i) => i !== question.correctIndex);
  return wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
}

// ---------- Helpers ----------

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function selectQuestions(subjectId: string, count: number): Question[] {
  const bank = QUESTION_BANKS[subjectId] ?? [];
  const shuffled = shuffleArray(bank);
  return shuffled.slice(0, count).map((q) => {
    // Shuffle options but keep track of correct answer
    const indices = q.options.map((_, i) => i);
    const shuffledIndices = shuffleArray(indices);
    const shuffledOptions = shuffledIndices.map((i) => q.options[i]);
    const newCorrectIndex = shuffledIndices.indexOf(q.correctIndex);
    return { text: q.text, options: shuffledOptions, correctIndex: newCorrectIndex };
  });
}

const QUESTIONS_PER_GAME = 10;
const TIME_PER_QUESTION = 15;
const PLAYER_POINTS = 10;
const AI_POINTS = 8;

// ---------- Component ----------

interface AIMatchProps {
  onBack: () => void;
}

export default function AIMatch({ onBack }: AIMatchProps) {
  const [phase, setPhase] = useState<GamePhase>('select');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [aiChoices, setAiChoices] = useState<boolean[]>([]);
  const [playerChoices, setPlayerChoices] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [answered, setAnswered] = useState(false);
  const timerRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];

  // Filter valid subjects (exclude TYT, Geo, Ing)
  const gameSubjects = SUBJECTS.filter(
    (s) => ['mat', 'fiz', 'kim', 'bio', 'edb'].includes(s.id)
  );

  // Start game with subject
  const startGame = (sid: string) => {
    const qs = selectQuestions(sid, QUESTIONS_PER_GAME);
    setSubjectId(sid);
    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAiScore(0);
    setAiChoices([]);
    setPlayerChoices([]);
    setTimeLeft(TIME_PER_QUESTION);
    setAnswered(false);
    setPhase('playing');
  };

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || showResult || answered) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto-skip
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, showResult, answered, currentIndex]);

  const handleTimeout = () => {
    if (answered) return;
    setAnswered(true);
    const aiIdx = aiAnswer(currentQuestion);
    const aiCorrect = aiIdx === currentQuestion.correctIndex;
    setSelectedAnswer(-1); // No answer selected
    setAiChoices((prev) => [...prev, aiCorrect]);
    setPlayerChoices((prev) => [...prev, false]);
    setAiScore((prev) => prev + (aiCorrect ? AI_POINTS : 0));
    setShowResult(true);
  };

  // Handle answer selection
  const handleAnswer = (index: number) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(index);

    const isCorrect = index === currentQuestion.correctIndex;
    setPlayerChoices((prev) => [...prev, isCorrect]);
    if (isCorrect) {
      setScore((prev) => prev + PLAYER_POINTS);
    }

    // AI answers
    const aiIdx = aiAnswer(currentQuestion);
    const aiCorrect = aiIdx === currentQuestion.correctIndex;
    setAiChoices((prev) => [...prev, aiCorrect]);
    if (aiCorrect) {
      setAiScore((prev) => prev + AI_POINTS);
    }

    setShowResult(true);
  };

  // Next question or finish
  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setPhase('result');
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(TIME_PER_QUESTION);
    setAnswered(false);
  };

  // Reset game
  const resetGame = () => {
    setPhase('select');
    setSubjectId(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAiScore(0);
    setAiChoices([]);
    setPlayerChoices([]);
    setTimeLeft(TIME_PER_QUESTION);
    setAnswered(false);
  };

  // ---------- Subject Selection Screen ----------
  if (phase === 'select') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
            Geri Dön
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            AI Match
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Bir ders seç ve yapay zekaya karşı bilgini test et!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {gameSubjects.map((subject) => (
            <motion.div
              key={subject.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                hover
                onClick={() => startGame(subject.id)}
                className="text-center cursor-pointer"
              >
                <div className="text-4xl mb-3">{subject.emoji}</div>
                <h3
                  className="font-semibold text-lg"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {subject.name}
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {QUESTIONS_PER_GAME} soru &middot; {TIME_PER_QUESTION} saniye
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // ---------- Result Screen ----------
  if (phase === 'result') {
    const playerCorrect = playerChoices.filter(Boolean).length;
    const aiCorrectCount = aiChoices.filter(Boolean).length;
    const isWin = score > aiScore;
    const isDraw = score === aiScore;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center"
      >
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
            Geri Dön
          </Button>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <Trophy
              className={`w-10 h-10 ${
                isWin
                  ? 'text-yellow-400'
                  : isDraw
                  ? 'text-gray-400'
                  : 'text-red-400'
              }`}
            />
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {isWin
              ? 'Tebrikler, Kazand\u0131n!'
              : isDraw
              ? 'Berabere!'
              : 'Kaybettin!'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="mb-8">
            {isWin
              ? "AI'y\u0131 yendin! Bilgin ger\u00E7ekten etkileyici."
              : isDraw
              ? '\u00C7ok yak\u0131nd\u0131! Bir daha dene.'
              : 'Bir dahaki sefere! Pratik yapmaya devam et.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card padding="md" className="text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {'\u{1F916}'} Sen
            </p>
            <p
              className="text-3xl font-bold mt-2"
              style={{ color: '#A78BFA' }}
            >
              {score}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {playerCorrect}/{QUESTIONS_PER_GAME} do\u011Fru
            </p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {'\u{1F916}'} AI
            </p>
            <p
              className="text-3xl font-bold mt-2"
              style={{ color: '#06B6D4' }}
            >
              {aiScore}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {aiCorrectCount}/{QUESTIONS_PER_GAME} do\u011Fru
            </p>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="primary" icon={RotateCcw} onClick={resetGame}>
            Tekrar Oyna
          </Button>
          <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
            Geri D\u00F6n
          </Button>
        </div>
      </motion.div>
    );
  }

  // ---------- Playing Screen ----------
  if (!currentQuestion) return null;

  const correctIndex = currentQuestion.correctIndex;
  const allAnswered = answered; // player has answered

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
          Geri Dön
        </Button>
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              backgroundColor:
                timeLeft <= 5 ? '#EF444420' : 'var(--badge-bg)',
            }}
          >
            <Clock
              className={`w-4 h-4 ${
                timeLeft <= 5 ? 'text-red-400' : ''
              }`}
              style={{ color: timeLeft <= 5 ? undefined : 'var(--text-muted)' }}
            />
            <span
              className={`text-sm font-semibold ${
                timeLeft <= 5 ? 'text-red-400' : ''
              }`}
              style={{
                color: timeLeft <= 5 ? undefined : 'var(--text-primary)',
              }}
            >
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-4">
        {questions.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-colors"
            style={{
              backgroundColor:
                i < currentIndex
                  ? playerChoices[i]
                    ? '#10B981'
                    : '#EF4444'
                  : i === currentIndex
                  ? '#A78BFA'
                  : 'var(--border-color)',
            }}
          />
        ))}
      </div>

      {/* Question card */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple">
            Soru {currentIndex + 1}/{QUESTIONS_PER_GAME}
          </Badge>
          <Badge variant="info">{questions.length} soru</Badge>
        </div>

        <h2
          className="text-lg font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {currentQuestion.text}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let bgColor = 'var(--badge-bg)';
            let borderColor = 'transparent';
            let textColor = 'var(--text-secondary)';

            if (allAnswered) {
              if (idx === correctIndex) {
                bgColor = '#10B98120';
                borderColor = '#10B981';
                textColor = '#10B981';
              } else if (idx === selectedAnswer && idx !== correctIndex) {
                bgColor = '#EF444420';
                borderColor = '#EF4444';
                textColor = '#EF4444';
              } else {
                bgColor = 'var(--badge-bg)';
                textColor = 'var(--text-muted)';
              }
            }

            return (
              <motion.button
                key={idx}
                whileHover={allAnswered ? undefined : { scale: 1.01 }}
                whileTap={allAnswered ? undefined : { scale: 0.99 }}
                onClick={() => handleAnswer(idx)}
                disabled={allAnswered}
                className="w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3"
                style={{
                  backgroundColor: bgColor,
                  borderColor: borderColor,
                  color: textColor,
                }}
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: allAnswered
                      ? idx === correctIndex
                        ? '#10B981'
                        : idx === selectedAnswer
                        ? '#EF4444'
                        : 'var(--bg-hover)'
                      : 'var(--bg-hover)',
                    color: allAnswered && (idx === correctIndex || idx === selectedAnswer)
                      ? '#fff'
                      : 'var(--text-muted)',
                  }}
                >
                  {allAnswered && idx === correctIndex
                    ? '\u2713'
                    : allAnswered && idx === selectedAnswer && idx !== correctIndex
                    ? '\u2717'
                    : String.fromCharCode(65 + idx)}
                </span>
                <span className="font-medium">{option}</span>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* AI answer display */}
      <AnimatePresence>
        {allAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    AI Cevab\u0131
                  </span>
                </div>
                {aiChoices[aiChoices.length - 1] ? (
                  <Badge variant="success" size="sm" dot>
                    Do\u011Fru ({AI_POINTS} puan)
                  </Badge>
                ) : (
                  <Badge variant="danger" size="sm" dot>
                    Yanl\u0131\u015F
                  </Badge>
                )}
              </div>
            </Card>

            {/* Score */}
            <Card padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {'\u{1F916}'} Sen
                    </p>
                    <p className="text-lg font-bold" style={{ color: '#A78BFA' }}>
                      {score}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {'\u{1F916}'} AI
                    </p>
                    <p className="text-lg font-bold" style={{ color: '#06B6D4' }}>
                      {aiScore}
                    </p>
                  </div>
                </div>

                <Button size="sm" onClick={nextQuestion}>
                  {currentIndex + 1 >= questions.length
                    ? 'Sonu\u00E7lar\u0131 G\u00F6r'
                    : 'Sonraki Soru \u2192'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
