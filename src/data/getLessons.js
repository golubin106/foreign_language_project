import { defaultLessons } from "./lessons";

export function getLessons() {
  const customLessons = JSON.parse(localStorage.getItem("customLessons")) || [];
  const editedLessons = JSON.parse(localStorage.getItem("editedLessons")) || [];
  const deletedLessons = JSON.parse(localStorage.getItem("deletedLessons")) || [];

  const mergedDefaultLessons = defaultLessons.map((lesson) => {
    const editedLesson = editedLessons.find((item) => item.id === lesson.id);
    return editedLesson ? editedLesson : lesson;
  });

  const mergedCustomLessons = customLessons.map((lesson) => {
    const editedLesson = editedLessons.find((item) => item.id === lesson.id);
    return editedLesson ? editedLesson : lesson;
  });

  return [...mergedDefaultLessons, ...mergedCustomLessons].filter(
    (lesson) => !deletedLessons.includes(lesson.id)
  );
}