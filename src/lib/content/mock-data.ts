import type {
  Exam,
  Question,
  QuestionOption,
  SafeQuestionPayload,
  Subject,
  Test,
  TestQuestion,
  Topic,
} from "@/types/models";
import { buildSafeQuestionPayload } from "@/lib/test-engine/safe-question-payload";
import type { ScoringQuestion } from "@/lib/scoring/types";

const now = "2026-08-24T00:00:00.000Z";

export const mockExams: Exam[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "SSC CGL",
    slug: "ssc-cgl",
    description:
      "Practice full-length and topic-wise MCQ tests for SSC CGL preparation.",
    logoUrl: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockSubjects: Subject[] = [
  {
    id: "22222222-2222-4222-8222-222222222222",
    examId: mockExams[0].id,
    name: "Quantitative Aptitude",
    slug: "quantitative-aptitude",
    description: "Arithmetic, algebra, geometry, and data interpretation.",
    orderIndex: 1,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockTopics: Topic[] = [
  {
    id: "33333333-3333-4333-8333-333333333333",
    subjectId: mockSubjects[0].id,
    name: "Percentage",
    slug: "percentage",
    description: "Percentage basics and applied percentage problems.",
    orderIndex: 1,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockQuestions: Question[] = [
  {
    id: "44444444-4444-4444-8444-444444444441",
    topicId: mockTopics[0].id,
    questionText: "What is 15% of 200?",
    questionType: "single_choice",
    difficulty: "easy",
    explanation: "15% of 200 is 30.",
    defaultMarks: 2,
    defaultNegativeMarks: 0.5,
    status: "published",
    createdBy: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "44444444-4444-4444-8444-444444444442",
    topicId: mockTopics[0].id,
    questionText: "If a value increases from 80 to 100, what is the percentage increase?",
    questionType: "single_choice",
    difficulty: "easy",
    explanation: "The increase is 20 on a base of 80, so 20/80 x 100 = 25%.",
    defaultMarks: 2,
    defaultNegativeMarks: 0.5,
    status: "published",
    createdBy: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "44444444-4444-4444-8444-444444444443",
    topicId: mockTopics[0].id,
    questionText: "A shopkeeper gives a 10% discount on an item marked at 500. What is the selling price?",
    questionType: "single_choice",
    difficulty: "easy",
    explanation: "10% of 500 is 50, so the selling price is 450.",
    defaultMarks: 2,
    defaultNegativeMarks: 0.5,
    status: "published",
    createdBy: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    topicId: mockTopics[0].id,
    questionText: "What is 40% expressed as a fraction $\\frac{a}{b}$ in simplest form?",
    questionType: "single_choice",
    difficulty: "easy",
    explanation: "40% equals $\\frac{40}{100}$, which divides numerator and denominator by 20 to yield $\\frac{2}{5}$.",
    defaultMarks: 2,
    defaultNegativeMarks: 0.5,
    status: "published",
    createdBy: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "44444444-4444-4444-8444-444444444445",
    topicId: mockTopics[0].id,
    questionText: "For the quadratic equation $x^2 - 5x + 6 = 0$, what is the sum of the roots $\\alpha + \\beta$?",
    questionType: "single_choice",
    difficulty: "easy",
    explanation: "Using Vieta's formulas, for $ax^2 + bx + c = 0$, the sum of roots is $-\\frac{b}{a} = -\\frac{-5}{1} = 5$.",
    defaultMarks: 2,
    defaultNegativeMarks: 0.5,
    status: "published",
    createdBy: null,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockQuestionOptions: QuestionOption[] = [
  option(mockQuestions[0].id, "20", false, 1),
  option(mockQuestions[0].id, "25", false, 2),
  option(mockQuestions[0].id, "30", true, 3),
  option(mockQuestions[0].id, "35", false, 4),
  option(mockQuestions[1].id, "20%", false, 1),
  option(mockQuestions[1].id, "25%", true, 2),
  option(mockQuestions[1].id, "30%", false, 3),
  option(mockQuestions[1].id, "40%", false, 4),
  option(mockQuestions[2].id, "400", false, 1),
  option(mockQuestions[2].id, "425", false, 2),
  option(mockQuestions[2].id, "450", true, 3),
  option(mockQuestions[2].id, "475", false, 4),
  option(mockQuestions[3].id, "$\\frac{1}{4}$", false, 1),
  option(mockQuestions[3].id, "$\\frac{2}{5}$", true, 2),
  option(mockQuestions[3].id, "$\\frac{3}{5}$", false, 3),
  option(mockQuestions[3].id, "$\\frac{4}{5}$", false, 4),
  option(mockQuestions[4].id, "3", false, 1),
  option(mockQuestions[4].id, "5", true, 2),
  option(mockQuestions[4].id, "6", false, 3),
  option(mockQuestions[4].id, "-5", false, 4),
];

export const mockTests: Test[] = [
  {
    id: "55555555-5555-4555-8555-555555555555",
    examId: mockExams[0].id,
    name: "SSC CGL Percentage Mini Mock",
    slug: "ssc-cgl-percentage-mini-mock",
    description: "A short timed MCQ test to validate the first attempt flow.",
    durationMinutes: 10,
    totalMarks: 10,
    passingMarks: null,
    isPublished: true,
    startsAt: null,
    endsAt: null,
    maxAttempts: null,
    scoreDisplayMode: "best",
    createdBy: null,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockTestQuestions: TestQuestion[] = mockQuestions.map(
  (question, index) => ({
    id: `66666666-6666-4666-8666-66666666666${index}`,
    testId: mockTests[0].id,
    questionId: question.id,
    orderIndex: index + 1,
    marks: question.defaultMarks,
    negativeMarks: question.defaultNegativeMarks,
    createdAt: now,
  }),
);

export function getPublishedExams() {
  return mockExams.filter((exam) => exam.isActive);
}

export function getExamBySlug(slug: string) {
  return mockExams.find((exam) => exam.slug === slug && exam.isActive) ?? null;
}

export function getTestsForExam(examId: string) {
  return mockTests.filter((test) => test.examId === examId && test.isPublished);
}

export function getTestById(testId: string) {
  return mockTests.find((test) => test.id === testId && test.isPublished) ?? null;
}

export function getQuestionCountForTest(testId: string) {
  return mockTestQuestions.filter((testQuestion) => testQuestion.testId === testId)
    .length;
}

export function getSafeQuestionsForTest(testId: string): SafeQuestionPayload[] {
  return mockTestQuestions
    .filter((testQuestion) => testQuestion.testId === testId)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((testQuestion) => {
      const question = mockQuestions.find(
        (candidate) => candidate.id === testQuestion.questionId,
      );

      if (!question) {
        throw new Error(`Missing question ${testQuestion.questionId}`);
      }

      return buildSafeQuestionPayload({
        question,
        options: mockQuestionOptions.filter(
          (option) => option.questionId === question.id,
        ),
        marks: testQuestion.marks,
        negativeMarks: testQuestion.negativeMarks,
      });
    });
}

export function getScoringQuestionsForTest(testId: string): ScoringQuestion[] {
  return mockTestQuestions
    .filter((testQuestion) => testQuestion.testId === testId)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((testQuestion) => {
      const question = mockQuestions.find(
        (candidate) => candidate.id === testQuestion.questionId,
      );
      const correctOption = mockQuestionOptions.find(
        (option) => option.questionId === testQuestion.questionId && option.isCorrect,
      );

      if (!question || !correctOption) {
        throw new Error(`Missing scoring data for question ${testQuestion.questionId}`);
      }

      return {
        questionId: question.id,
        correctOptionId: correctOption.id,
        marks: testQuestion.marks ?? question.defaultMarks,
        negativeMarks: testQuestion.negativeMarks ?? question.defaultNegativeMarks,
      };
    });
}

export function getAnswerReviewForTest(testId: string) {
  return mockTestQuestions
    .filter((testQuestion) => testQuestion.testId === testId)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((testQuestion) => {
      const question = mockQuestions.find(
        (candidate) => candidate.id === testQuestion.questionId,
      );
      const options = mockQuestionOptions
        .filter((option) => option.questionId === testQuestion.questionId)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      const correctOption = options.find((option) => option.isCorrect);

      if (!question || !correctOption) {
        throw new Error(`Missing review data for question ${testQuestion.questionId}`);
      }

      return {
        questionId: question.id,
        questionText: question.questionText,
        explanation: question.explanation,
        correctOptionId: correctOption.id,
        correctOptionText: correctOption.optionText,
        options: options.map((option) => ({
          id: option.id,
          optionText: option.optionText,
        })),
      };
    });
}

function option(
  questionId: string,
  optionText: string,
  isCorrect: boolean,
  orderIndex: number,
): QuestionOption {
  return {
    id: buildOptionId(questionId, orderIndex),
    questionId,
    optionText,
    isCorrect,
    orderIndex,
    createdAt: now,
    updatedAt: now,
  };
}

function buildOptionId(questionId: string, orderIndex: number) {
  const questionNumber = questionId.at(-1);

  if (!questionNumber) {
    throw new Error(`Invalid question ID: ${questionId}`);
  }

  return `77777777-7777-4777-8777-777777777${questionNumber}${orderIndex
    .toString()
    .padStart(2, "0")}`;
}
