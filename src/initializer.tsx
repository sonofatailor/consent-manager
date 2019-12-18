import React from 'react'
import ReactDOM from 'react-dom'
import inEU from '@segment/in-eu'
import { ConsentManager, openConsentManager, doNotTrack } from '.'
import { ConsentManagerProps, StandaloneConsentManagerParams, ConsentManagerInput } from './types'
import { CloseBehavior } from './consent-manager/container'
import * as preferences from './consent-manager-builder/preferences'
import { onLoadExternalDestinations } from './consent-manager-builder/analytics'

export const version = process.env.VERSION
export { openConsentManager, doNotTrack, inEU, preferences }

const initializeConsentManager = (
  getConsentManagerConfig: (args: StandaloneConsentManagerParams) => ConsentManagerInput
) => {
  let containerRef: string | undefined
  let props: Partial<ConsentManagerInput> = {}

  props = getConsentManagerConfig({
    React,
    version,
    openConsentManager,
    doNotTrack,
    inEU,
    preferences,
    onLoadExternalDestinations
  })
  containerRef = props.container

  if (!containerRef) {
    throw new Error('ConsentManager: container is required')
  }

  if (!props.writeKey) {
    throw new Error('ConsentManager: writeKey is required')
  }

  if (!props.bannerContent) {
    throw new Error('ConsentManager: bannerContent is required')
  }

  if (!props.preferencesDialogContent) {
    throw new Error('ConsentManager: preferencesDialogContent is required')
  }

  if (!props.cancelDialogContent) {
    throw new Error('ConsentManager: cancelDialogContent is required')
  }

  if (typeof props.implyConsentOnInteraction === 'string') {
    props.implyConsentOnInteraction = props.implyConsentOnInteraction === 'true'
  }

  if (props.closeBehavior !== undefined && typeof props.closeBehavior === 'string') {
    const options = [
      CloseBehavior.ACCEPT.toString(),
      CloseBehavior.DENY.toString(),
      CloseBehavior.DISMISS.toString()
    ]

    if (!options.includes(props.closeBehavior)) {
      throw new Error(`ConsentManager: closeBehavior should be one of ${options}`)
    }
  }

  const container = document.querySelector(containerRef)
  if (!container) {
    throw new Error('ConsentManager: container not found')
  }

  ReactDOM.render(<ConsentManager {...(props as ConsentManagerProps)} />, container)
}

export default initializeConsentManager
