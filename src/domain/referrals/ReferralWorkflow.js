import { PriorityQueue } from '../../core/PriorityQueue.js'

const PATH = ['flagged', 'referred', 'contacted', 'appointment_booked', 'completed']
const EDGES = new Map(PATH.map((status, index) => [status, new Set(PATH[index + 1] ? [PATH[index + 1]] : [])]))
EDGES.set('cancelled', new Set())

export class ReferralWorkflow {
  #graph
  #indexes

  constructor(graph = EDGES) {
    this.#graph = new Map([...graph].map(([node, neighbours]) => [node, new Set(neighbours)]))
    this.#indexes = new Map(PATH.map((status, index) => [status, index]))
  }

  get steps() {
    return [...PATH]
  }

  next(status) {
    return this.#graph.get(status)?.values().next().value ?? null
  }

  index(status) {
    return this.#indexes.get(status) ?? -1
  }

  canTransition(from, to) {
    if (to === 'cancelled') return this.#graph.has(from) && !['completed', 'cancelled'].includes(from)
    return this.#graph.get(from)?.has(to) ?? false
  }

  shortestPath(from, to) {
    if (from === to) return [from]
    const queue = [[from]]
    const visited = new Set([from])
    let cursor = 0
    while (cursor < queue.length) {
      const path = queue[cursor++]
      const node = path[path.length - 1]
      for (const neighbour of this.#graph.get(node) ?? []) {
        if (visited.has(neighbour)) continue
        const nextPath = [...path, neighbour]
        if (neighbour === to) return nextPath
        visited.add(neighbour)
        queue.push(nextPath)
      }
    }
    return null
  }
}

const priorityRank = new Map([['urgent', 0], ['priority', 1], ['routine', 2]])

function compareReferrals(left, right) {
  const leftClosed = ['completed', 'cancelled'].includes(left.status) ? 1 : 0
  const rightClosed = ['completed', 'cancelled'].includes(right.status) ? 1 : 0
  if (leftClosed !== rightClosed) return leftClosed - rightClosed
  const rankDifference = (priorityRank.get(left.priority) ?? 3) - (priorityRank.get(right.priority) ?? 3)
  if (rankDifference) return rankDifference
  const leftDue = left.due_at ? new Date(left.due_at).getTime() : Number.MAX_SAFE_INTEGER
  const rightDue = right.due_at ? new Date(right.due_at).getTime() : Number.MAX_SAFE_INTEGER
  if (leftDue !== rightDue) return leftDue - rightDue
  return String(left.id).localeCompare(String(right.id))
}

export class ReferralPriorityQueue extends PriorityQueue {
  constructor(referrals = []) {
    super(compareReferrals)
    for (const referral of referrals) this.enqueue(referral)
  }
}

export const referralWorkflow = new ReferralWorkflow()
export const REFERRAL_STEPS = referralWorkflow.steps
