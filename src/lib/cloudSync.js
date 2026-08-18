// Alibaba Cloud Function Compute & Tablestore Queue Sync Service
// Enables offline-first record synchronization when internet connectivity is restored.

import { getStoredRecords, saveRecord } from './storage'
import { buildFhirBundle } from './platform'

const CLOUD_SYNC_ENDPOINT = import.meta.env.VITE_CLOUD_SYNC_URL || 'https://vytal-fc.cn-hangzhou.fcapp.run/sync-records'

/**
 * Syncs all pending (unsynced) patient records to Alibaba Cloud FC / Tablestore backend
 */
export async function syncQueueToAlibabaCloud() {
  const records = getStoredRecords()
  const pendingRecords = records.filter((r) => !r.synced)

  if (pendingRecords.length === 0) {
    return {
      success: true,
      syncedCount: 0,
      message: 'Queue is up to date. No pending records to sync.',
    }
  }

  try {
    const fhirBundle = pendingRecords.map((r) => buildFhirBundle(r))

    // Attempt HTTPS call to Alibaba Cloud Function Compute / Backend REST endpoint
    const response = await fetch(CLOUD_SYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vytal-Client-Version': '1.0.0',
      },
      body: JSON.stringify({
        records: pendingRecords,
        fhirBundle,
        timestamp: new Date().toISOString(),
      }),
    })

    if (response.ok) {
      // Only a genuine 2xx response confirms the backend actually persisted
      // the records — this is the sole condition that should flip `synced`.
      pendingRecords.forEach((r) => {
        saveRecord({ ...r, synced: true })
      })

      return {
        success: true,
        syncedCount: pendingRecords.length,
        message: `Successfully synchronized ${pendingRecords.length} records to Alibaba Cloud Tablestore.`,
      }
    }

    // Non-2xx (including 404/502) means the backend did NOT confirm receipt.
    // Previously this was treated as success and silently marked `synced:
    // true`, so records could be permanently lost while the UI reported them
    // as safely synced. Leave them pending so a retry will pick them up.
    console.warn(`Cloud sync endpoint returned ${response.status}; leaving ${pendingRecords.length} record(s) pending`)
    return {
      success: false,
      syncedCount: 0,
      message: `Cloud sync unavailable (server returned ${response.status}). ${pendingRecords.length} record(s) remain queued locally and will retry.`,
    }
  } catch (err) {
    // Network failure (offline, DNS, timeout, etc.) — same rule applies:
    // do NOT mark as synced. Records stay queued for the next attempt.
    console.warn('Cloud sync connection failed; leaving records queued locally', err)
    return {
      success: false,
      syncedCount: 0,
      message: `Offline — ${pendingRecords.length} record(s) saved locally and queued to sync when connectivity returns.`,
    }
  }
}
