export const cacheTags = {
  exams: "exams",
  exam: (examId: string) => `exam:${examId}`,
  subjects: "subjects",
  subject: (subjectId: string) => `subject:${subjectId}`,
  topics: "topics",
  topic: (topicId: string) => `topic:${topicId}`,
  tests: "tests",
  test: (testId: string) => `test:${testId}`,
  questionsForTest: (testId: string) => `questions:${testId}`,
} as const;
