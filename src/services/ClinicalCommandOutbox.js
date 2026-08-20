import { MemoryOutbox } from '../core/MemoryOutbox.js'
import { referralRepository } from '../domain/repositories.js'

export class ClinicalCommandOutbox {
  #commands = new MemoryOutbox(50)
  #pendingReferralIds = new Set()

  get size() {
    return this.#commands.size
  }

  enqueueReferralTransition(referralId, nextStatus) {
    if (this.#pendingReferralIds.has(referralId)) {
      throw new Error('This referral already has an offline update queued.')
    }
    const size = this.#commands.enqueue({ type: 'referral.transition', referralId, nextStatus })
    this.#pendingReferralIds.add(referralId)
    return size
  }

  flush() {
    return this.#commands.drain(async (command) => {
      if (command.type !== 'referral.transition') throw new Error('Unsupported offline command.')
      await referralRepository.transition(command.referralId, command.nextStatus)
      this.#pendingReferralIds.delete(command.referralId)
    })
  }
}

export const clinicalCommandOutbox = new ClinicalCommandOutbox()
