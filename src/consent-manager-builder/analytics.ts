import isEmpty from 'lodash/isEmpty'
import pickBy from 'lodash/pickBy'
import { EventEmitter } from 'events'
import { WindowWithAJS, Destination } from '../types'

interface AnalyticsParams {
  writeKey: string
  destinations: Destination[]
  destinationPreferences: object | null
  externalDestinations?: Destination[]
  isConsentRequired: boolean
  shouldReload?: boolean
}

interface EmitLoadExternalDestinationParams {
  integrations?: object
  externalDestinations: Destination[]
}

const emitter = new EventEmitter()

export const onLoadExternalDestinations = (listener: (integrations: object) => void) => {
  emitter.on('loadExternalDestinations', listener)
  return () => emitter.off('loadExternalDestinations', listener)
}

const emitLoadExternalDestinations = ({
  integrations,
  externalDestinations
}: EmitLoadExternalDestinationParams): void => {
  const externalIntegrations = pickBy(integrations, (_, integrationId) =>
    externalDestinations.find(
      externalDestination => externalDestination.creationName === integrationId
    )
  )

  emitter.emit('loadExternalDestinations', externalIntegrations)
}

const emitLoadAllExternalDestinations = (externalDestinations: Destination[]): void => {
  const externalIntegrations = externalDestinations.reduce(
    (acc: object, destination: Destination) => ({
      ...acc,
      [destination.creationName as string]: true
    }),
    {}
  )

  emitter.emit('loadExternalDestinations', externalIntegrations)
}

export default function conditionallyLoadAnalytics({
  writeKey,
  destinations,
  destinationPreferences,
  externalDestinations = [],
  isConsentRequired,
  shouldReload = true
}: AnalyticsParams) {
  const wd = window as WindowWithAJS
  const integrations = { All: false, 'Segment.io': true }
  let isAnythingEnabled = false

  if (!destinationPreferences || isEmpty(destinationPreferences)) {
    if (isConsentRequired) {
      return
    }

    // Load a.js normally when consent isn't required and there's no preferences
    if (!wd.analytics.initialized) {
      wd.analytics.load(writeKey)
      emitLoadAllExternalDestinations(externalDestinations)
    }
    return
  }

  for (const destination of destinations) {
    const isEnabled = Boolean(destinationPreferences[destination.id])
    if (isEnabled) {
      isAnythingEnabled = true
    }
    integrations[destination.id] = isEnabled
  }

  // Reload the page if the trackers have already been initialised so that
  // the user's new preferences can take affect
  if (wd.analytics && wd.analytics.initialized) {
    if (shouldReload) {
      window.location.reload()
    }
    return
  }

  // Don't load a.js at all if nothing has been enabled
  if (isAnythingEnabled) {
    // TODO: filter out external integrations
    wd.analytics.load(writeKey, { integrations })
    emitLoadExternalDestinations({ integrations, externalDestinations })
  }
}
