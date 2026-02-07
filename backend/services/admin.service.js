import { collection } from "firebase/firestore";

export class AdminService {
  constructor(db) {
    this.db = db;
    this.quizCollection = collection(db, process.env.COLLECTION_QUIZZES);
    this.resultCollection = collection(db.process.env.COLLECTION_RESULTS);
  }
  async evaluateResult(resultId, adminUserId, scores) {
    
  }
}
