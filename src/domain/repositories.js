import {
  getRecordById,
  getStoredRecords,
  getStoredRecordsPage,
  saveRecord,
  syncPendingRecords,
} from '../lib/storage.js'
import {
  createPatient,
  getPatients,
  getPatientsPage,
  getReferrals,
  getReferralsPage,
  updatePatientConsent,
  updateReferralStatus,
} from '../lib/patients.js'

export class Repository {
  constructor(entityName) {
    if (new.target === Repository) throw new TypeError('Repository is abstract.')
    this.entityName = entityName
  }
}

export class ScreeningRepository extends Repository {
  constructor() {
    super('screening')
  }

  list() { return getStoredRecords() }
  listPage(options) { return getStoredRecordsPage(options) }
  findById(id) { return getRecordById(id) }
  save(record) { return saveRecord(record) }
  sync() { return syncPendingRecords() }
}

export class PatientRepository extends Repository {
  constructor() {
    super('patient')
  }

  list() { return getPatients() }
  listPage(options) { return getPatientsPage(options) }
  create(input) { return createPatient(input) }
  updateConsent(id, status) { return updatePatientConsent(id, status) }
}

export class ReferralRepository extends Repository {
  constructor() {
    super('referral')
  }

  list() { return getReferrals() }
  listPage(options) { return getReferralsPage(options) }
  transition(id, status) { return updateReferralStatus(id, status) }
}

export const screeningRepository = new ScreeningRepository()
export const patientRepository = new PatientRepository()
export const referralRepository = new ReferralRepository()
