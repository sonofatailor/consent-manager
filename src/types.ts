import { CloseBehavior } from './consent-manager/container'
import { PreferencesManager } from './consent-manager-builder/preferences'

type AJS = SegmentAnalytics.AnalyticsJS & {
  initialized: boolean
}

export type WindowWithAJS = Window &
  typeof globalThis & {
    analytics?: AJS
  }

export type WindowWithConsentManagerConfig = Window &
  typeof globalThis & {
    consentManagerConfig?: (
      args: StandaloneConsentManagerParams
    ) => ConsentManagerInput | ConsentManagerInput
  }

export type ConsentManagerInput = ConsentManagerProps & {
  container: string
}

export interface StandaloneConsentManagerParams {
  React: unknown
  version?: string
  openConsentManager: () => void
  doNotTrack: () => boolean | null
  inEU: () => boolean
  preferences: PreferencesManager
  onLoadExternalDestinations: (listener: (integrations: object) => void) => any
}

export interface Preferences {
  destinationPreferences?: CategoryPreferences
  customPreferences?: CategoryPreferences
}

export interface Destination {
  id: string
  name: string
  creationName?: string
  description: string
  website: string
  category: string
}

export interface CategoryPreferences {
  functional?: boolean | null | undefined
  marketingAndAnalytics?: boolean | null | undefined
  advertising?: boolean | null | undefined
  [category: string]: boolean | null | undefined
}

export interface CustomCategories {
  [key: string]: CustomCategory
}

interface CustomCategory {
  integrations: string[]
  purpose: string
}

export interface ConsentManagerProps {
  writeKey: string
  otherWriteKeys?: string[]
  shouldRequireConsent?: () => Promise<boolean> | boolean
  externalDestinations?: Destination[]
  implyConsentOnInteraction?: boolean
  cookieDomain?: string
  bannerContent: React.ReactNode
  bannerSubContent?: string
  bannerTextColor?: string
  bannerBackgroundColor?: string
  preferencesDialogTitle?: React.ReactNode
  preferencesDialogContent: React.ReactNode
  onError?: (error: Error | undefined) => void
  cancelDialogTitle?: React.ReactNode
  cancelDialogContent: React.ReactNode
  closeBehavior?: CloseBehavior
  initialPreferences?: CategoryPreferences
  customCategories?: CustomCategories
  integrationsExcludedFromLoading?: string[]
}
