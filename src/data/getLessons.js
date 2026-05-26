import { defaultLessons } from "./lessons";
import { readJson } from "../utils/storage";

function readLessonList(key) {
  const value = readJson(key, []);
  return Array.isArray(value) ? value : [];
}

export function getLessons() {
  const customLessons = readLessonList("customLessons");
  const editedLessons = readLessonList("editedLessons");
  const deletedLessons = readLessonList("deletedLessons");

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
