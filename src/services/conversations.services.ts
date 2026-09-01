import { ObjectId } from 'mongodb'
import databaseService from './database.services'

class ConversationsService {
  async getConversation(sender_id: string, reveiver_id: string, page: number, limit: number) {
    const match = {
      $or: [
        { sender_id: new ObjectId(sender_id), receiver_id: new ObjectId(reveiver_id) },
        { sender_id: new ObjectId(reveiver_id), receiver_id: new ObjectId(sender_id) }
      ]
    }
    const conversations = await databaseService.converSation
      .find(match)
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    const totol = await databaseService.converSation.countDocuments(match)

    return {
      conversations,
      totol
    }
  }
}

const conversationService = new ConversationsService()
export default conversationService
