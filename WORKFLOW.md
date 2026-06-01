# QuizForge Workflow Diagrams

This document describes the current user and admin workflows in QuizForge. The diagrams use Mermaid, so they render directly on GitHub and in many Markdown viewers.

## Overall Application Flow

```mermaid
flowchart TD
  Start([Visitor opens QuizForge]) --> Landing[Landing page]
  Landing --> AuthChoice{Has an account?}

  AuthChoice -->|No| Register[Register page]
  AuthChoice -->|Yes| Login[Login page]

  Register --> RoleSelect[Select role: student or admin]
  RoleSelect --> RegisterMethod{Registration method}
  RegisterMethod -->|Email/password| RegisterEmail[Submit name, email, password, role]
  RegisterMethod -->|Google OAuth| RegisterGoogle[Open Google popup]

  RegisterEmail --> BackendRegister[POST /api/auth/register]
  RegisterGoogle --> FirebaseAuth[Firebase verifies Google identity]
  FirebaseAuth --> GoogleToken[Frontend receives Google ID token]
  GoogleToken --> BackendGoogleRegister[POST /api/auth/google with selected role]

  BackendRegister --> CreateUser[Create Firestore user]
  BackendGoogleRegister --> ExistingDuringRegister{Email already exists?}
  ExistingDuringRegister -->|No| CreateGoogleUser[Create Firestore user with selected role]
  ExistingDuringRegister -->|Yes| UseExistingUser[Use existing saved role]

  CreateUser --> IssueToken[Issue app JWT and set quizforge_token cookie]
  CreateGoogleUser --> IssueToken
  UseExistingUser --> IssueToken

  Login --> LoginMethod{Login method}
  LoginMethod -->|Email/password| LoginEmail[Submit email and password]
  LoginMethod -->|Google OAuth| LoginGoogle[Open Google popup]

  LoginEmail --> BackendLogin[POST /api/auth/login]
  BackendLogin --> PasswordCheck{Valid credentials?}
  PasswordCheck -->|No| AuthError[Show auth error]
  PasswordCheck -->|Yes| IssueToken

  LoginGoogle --> FirebaseLogin[Firebase verifies Google identity]
  FirebaseLogin --> LoginIdToken[Frontend receives Google ID token]
  LoginIdToken --> BackendGoogleLogin[POST /api/auth/google without role]
  BackendGoogleLogin --> ExistingDuringLogin{Firestore user exists?}
  ExistingDuringLogin -->|No| RegisterFirst[Show: Please register first]
  ExistingDuringLogin -->|Yes| IssueToken

  IssueToken --> RoleRedirect{Saved user role}
  RoleRedirect -->|student| StudentDashboard[Student dashboard]
  RoleRedirect -->|admin| AdminDashboard[Admin dashboard]

  AuthError --> Login
  RegisterFirst --> Register
```

## Student Workflow

```mermaid
flowchart TD
  StudentStart([Student authenticated]) --> Dashboard[Student dashboard]
  Dashboard --> FetchQuizzes[Load active quizzes]
  FetchQuizzes --> QuizList[Show public and private quizzes]

  QuizList --> SelectQuiz[Student selects a quiz]
  SelectQuiz --> QuizDetails[Quiz details page]
  QuizDetails --> VisibilityCheck{Quiz visibility}

  VisibilityCheck -->|Public| AttemptRequest[Request quiz attempt]
  VisibilityCheck -->|Private| TokenPrompt[Ask for access token]
  TokenPrompt --> SubmitAccessToken[POST /api/quizzes/:quizId/start]
  SubmitAccessToken --> TokenValid{Access token valid?}
  TokenValid -->|No| TokenError[Show invalid token error]
  TokenError --> TokenPrompt
  TokenValid -->|Yes| AttemptRequest

  AttemptRequest --> LoadQuestions[GET /api/quizzes/:quizId/attempt]
  LoadQuestions --> AttemptScreen[Timed quiz attempt screen]

  AttemptScreen --> AnswerQuestion{Question type}
  AnswerQuestion -->|MCQ| SelectOption[Select one option]
  AnswerQuestion -->|True/false| SelectBoolean[Select true or false]
  AnswerQuestion -->|Short integer| EnterNumber[Enter numeric answer]
  AnswerQuestion -->|Short subjective| EnterText[Enter written answer]

  SelectOption --> ContinueAttempt{More questions?}
  SelectBoolean --> ContinueAttempt
  EnterNumber --> ContinueAttempt
  EnterText --> ContinueAttempt

  ContinueAttempt -->|Yes| AnswerQuestion
  ContinueAttempt -->|No| SubmitQuiz[Submit quiz]
  AttemptScreen --> TimerExpired[Timer expires]
  TimerExpired --> SubmitQuiz

  SubmitQuiz --> BackendSubmit[POST /api/quizzes/:quizId/submit]
  BackendSubmit --> ValidateTimer{Submission within allowed time?}
  ValidateTimer -->|No| RejectSubmit[Reject or fail submission]
  ValidateTimer -->|Yes| EvaluateAnswers[Evaluate submitted answers]

  EvaluateAnswers --> ObjectiveAuto[Auto-grade MCQ, true/false, short integer]
  EvaluateAnswers --> SubjectivePending[Mark short subjective as pending]

  ObjectiveAuto --> SaveResult[Save result in Firestore]
  SubjectivePending --> SaveResult

  SaveResult --> ResultPage[Result page]
  ResultPage --> PendingCheck{Any subjective answers pending?}
  PendingCheck -->|Yes| PendingNotice[Show pending evaluation status]
  PendingCheck -->|No| FinalScore[Show final score and breakdown]

  ResultPage --> Leaderboard[View leaderboard]
  ResultPage --> History[View attempt history]
  History --> Stats[View student stats]
  Leaderboard --> Dashboard
  Stats --> Dashboard
```

### Student Flow Notes

- Students can only access student routes after authentication.
- Public quizzes can be attempted directly.
- Private quizzes require an access token before questions are released.
- Objective question types are graded automatically.
- Short subjective answers remain pending until an admin evaluates them.
- Student history and stats are computed from saved result records.

## Admin Workflow

```mermaid
flowchart TD
  AdminStart([Admin authenticated]) --> AdminDashboard[Admin dashboard]
  AdminDashboard --> AdminAction{Choose action}

  AdminAction -->|Create quiz| CreateQuiz[Create quiz page]
  CreateQuiz --> FillQuizMeta[Enter title, description, duration, visibility]
  FillQuizMeta --> VisibilityChoice{Visibility}
  VisibilityChoice -->|Public| SavePublicQuiz[Save quiz without access token]
  VisibilityChoice -->|Private| EnterQuizToken[Enter private access token]
  EnterQuizToken --> EncryptToken[Backend encrypts access token]
  SavePublicQuiz --> StoreQuiz[Store quiz in Firestore]
  EncryptToken --> StoreQuiz
  StoreQuiz --> AddQuestions[Add questions page]

  AdminAction -->|Edit quiz| EditQuiz[Edit quiz metadata]
  EditQuiz --> UpdateQuiz[PUT /api/admin/quizzes/:quizId]
  UpdateQuiz --> AdminDashboard

  AdminAction -->|Manage questions| AddQuestions
  AddQuestions --> QuestionType{Question type}
  QuestionType -->|MCQ| ConfigureMCQ[Write question, options, correct option, points]
  QuestionType -->|True/false| ConfigureTF[Write question, correct boolean, points]
  QuestionType -->|Short integer| ConfigureInteger[Write question, numeric answer, points]
  QuestionType -->|Short subjective| ConfigureSubjective[Write question, expected answer or rubric, points]

  ConfigureMCQ --> SaveQuestion[POST /api/admin/quizzes/:quizId/questions]
  ConfigureTF --> SaveQuestion
  ConfigureInteger --> SaveQuestion
  ConfigureSubjective --> SaveQuestion
  SaveQuestion --> MoreQuestions{Add more questions?}
  MoreQuestions -->|Yes| AddQuestions
  MoreQuestions -->|No| PublishDecision{Ready to publish?}

  PublishDecision -->|No| KeepDraft[Keep quiz as draft or unpublished]
  PublishDecision -->|Yes| PublishQuiz[POST /api/admin/quizzes/:quizId/publish]
  KeepDraft --> AdminDashboard
  PublishQuiz --> AdminDashboard

  AdminAction -->|Publish or unpublish| PublishToggle{Current status}
  PublishToggle -->|Unpublished| PublishExisting[Publish quiz]
  PublishToggle -->|Published| UnpublishQuiz[Unpublish quiz]
  PublishExisting --> AdminDashboard
  UnpublishQuiz --> AdminDashboard

  AdminAction -->|View results| ResultsList[Open quiz results]
  ResultsList --> ResultType{Any pending subjective answers?}
  ResultType -->|No| ViewFinalResults[View final scores and submissions]
  ResultType -->|Yes| PendingQueue[Open pending evaluation queue]

  PendingQueue --> ReviewSubmission[Review student subjective answer]
  ReviewSubmission --> CompareAnswer[Compare with question and expected answer]
  CompareAnswer --> GradeAnswer[Mark correct or incorrect and assign points]
  GradeAnswer --> SaveEvaluation[POST /api/admin/results/:resultId/evaluate]
  SaveEvaluation --> PendingMore{More pending answers?}
  PendingMore -->|Yes| PendingQueue
  PendingMore -->|No| RecalculateResult[Result becomes fully evaluated]
  RecalculateResult --> ViewFinalResults

  ViewFinalResults --> AdminDashboard

  AdminAction -->|Delete quiz| DeleteConfirm[Confirm delete]
  DeleteConfirm --> DeleteQuiz[DELETE /api/admin/quizzes/:quizId]
  DeleteQuiz --> AdminDashboard
```

### Admin Flow Notes

- Admin routes are protected by authentication and role authorization middleware.
- Private quiz access tokens are encrypted before storage.
- Admins can create, update, delete, publish, and unpublish quizzes.
- Admins can manage questions independently from quiz metadata.
- Objective questions are auto-graded during student submission.
- Subjective answers require manual evaluation before results are final.

## Backend Auth And Authorization Flow

```mermaid
sequenceDiagram
  participant Browser
  participant React
  participant Express
  participant FirebaseAuth as Firebase Auth
  participant Firestore

  Browser->>React: User clicks login/register

  alt Email/password
    React->>Express: POST /api/auth/login or /api/auth/register
    Express->>Firestore: Find or create user
    Express->>Express: Hash/check password
  else Google OAuth
    React->>FirebaseAuth: Open Google popup
    FirebaseAuth-->>React: Return Firebase ID token
    React->>Express: POST /api/auth/google
    Express->>FirebaseAuth: Verify ID token using Admin SDK
    FirebaseAuth-->>Express: Token valid with email/profile
    Express->>Firestore: Find or create app user
  end

  Express->>Express: Generate app JWT
  Express-->>Browser: Set HTTP-only quizforge_token cookie
  Express-->>React: Return user object
  React->>React: Store user in AuthContext

  Browser->>Express: Request protected route/API with cookie
  Express->>Express: authenticateToken middleware verifies JWT
  Express->>Firestore: Load user by JWT id
  Express->>Express: authorizeAdminRole if admin route
  Express-->>Browser: Return protected data or 401/403
```

## Result Evaluation Flow

```mermaid
flowchart TD
  Submit([Student submits quiz]) --> LoadQuiz[Load quiz and questions]
  LoadQuiz --> EachAnswer[Process each submitted answer]
  EachAnswer --> TypeCheck{Question type}

  TypeCheck -->|MCQ| CheckOption[Compare selected option index]
  TypeCheck -->|True/false| CheckBoolean[Compare selected boolean]
  TypeCheck -->|Short integer| CheckNumber[Normalize and compare number]
  TypeCheck -->|Short subjective| MarkPending[Mark answer pending manual evaluation]

  CheckOption --> AssignAutoPoints[Assign points automatically]
  CheckBoolean --> AssignAutoPoints
  CheckNumber --> AssignAutoPoints
  AssignAutoPoints --> MoreAnswers{More answers?}
  MarkPending --> MoreAnswers

  MoreAnswers -->|Yes| EachAnswer
  MoreAnswers -->|No| StoreResult[Store result with score and answer breakdown]
  StoreResult --> PendingSubjective{Has pending subjective?}
  PendingSubjective -->|No| FinalResult[Result is final]
  PendingSubjective -->|Yes| AdminReview[Admin reviews pending answers]
  AdminReview --> ManualGrade[Admin assigns correctness and points]
  ManualGrade --> UpdateResult[Update result record]
  UpdateResult --> FinalResult
```

