import { defaultLessons } from "./lessons";
import { readArray } from "../utils/storage";

export function getLessons() {
  const customLessons = readArray("customLessons");
  const editedLessons = readArray("editedLessons");
  const deletedLessons = readArray("deletedLessons");

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
