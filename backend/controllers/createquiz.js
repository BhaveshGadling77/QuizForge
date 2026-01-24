import { uploadQuiz } from "../utils/quizzes.utils.js";

export async function createQuiz(req, res) {
  console.log(req.body);
  let {
    title,
    description,
    visibility,
    accessToken,
    totalQuestions,
    questions,
    totalPoints,
    isActive = true,
  } = req.body;
  console.log(req.body)
  //validate the this fields

  if (visibility == "private") {
    if (!accessToken) {
      return res.status(401).json({ msg: "access token is invalid" });
    }
    await uploadQuiz({
      title,
      description,
      accessToken,
      totalPoints,
      totalQuestions,
      questions,
      visibility,
      isActive
    });
    res.json({ msg: "data saved Successfully." });
  }
  accessToken = null
  await uploadQuiz({
    title,
    description,
    accessToken,
    totalPoints,
    totalQuestions,
    questions,
    visibility,
    isActive
  });
  res.json({msg: "Data saved Successfully."})
}
