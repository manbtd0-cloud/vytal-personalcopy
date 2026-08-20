import { applicationEvents } from '../core/EventBus.js'
import { requireAuthenticatedUser, supabase, supabaseConfigured } from '../lib/supabase.js'

export class ClinicalRealtimeService {
  #channel = null

  async subscribe(listener) {
    if (!supabaseConfigured || !supabase) return () => {}
    const user = await requireAuthenticatedUser()
    const channelName = `clinical-updates:${user.id}`
    this.#channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'referrals', filter: `user_id=eq.${user.id}`,
      }, (payload) => this.#publish('referral.changed', payload, listener))
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'screenings', filter: `user_id=eq.${user.id}`,
      }, (payload) => this.#publish('screening.created', payload, listener))
      .subscribe()

    return () => this.unsubscribe()
  }

  async unsubscribe() {
    if (!this.#channel || !supabase) return
    const channel = this.#channel
    this.#channel = null
    await supabase.removeChannel(channel)
  }

  #publish(eventName, payload, listener) {
    applicationEvents.publish(eventName, payload)
    listener?.({ eventName, payload })
  }
}

export const clinicalRealtimeService = new ClinicalRealtimeService()
