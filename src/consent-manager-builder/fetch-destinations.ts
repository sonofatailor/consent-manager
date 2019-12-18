import fetch from 'isomorphic-fetch'
import flatten from 'lodash/flatten'
import map from 'lodash/map'
import sortedUniqBy from 'lodash/sortedUniqBy'
import sortBy from 'lodash/sortBy'
import { Destination } from '../types'

const transformDestinations = (destinations: Destination[]) =>
  map(destinations, (destination: Destination) => {
    const { creationName, ...restOfDestination } = destination

    return {
      id: creationName,
      ...restOfDestination
    }
  })

async function fetchDestinationForWriteKey(writeKey: string): Promise<Destination[]> {
  const res = await fetch(`https://cdn.segment.com/v1/projects/${writeKey}/integrations`)

  if (!res.ok) {
    throw new Error(
      `Failed to fetch integrations for write key ${writeKey}: HTTP ${res.status} ${res.statusText}`
    )
  }

  const destinations = await res.json()

  return destinations
}

export default async function fetchDestinations(
  writeKeys: string[],
  externalDestinations: Destination[] = []
): Promise<Destination[]> {
  const destinationsRequests: Promise<Destination[]>[] = []
  for (const writeKey of writeKeys) {
    destinationsRequests.push(fetchDestinationForWriteKey(writeKey))
  }

  let destinations = flatten(await Promise.all(destinationsRequests))
  destinations = [...destinations, ...externalDestinations]
  destinations = transformDestinations(destinations)
  // Remove the dummy Repeater destination
  destinations = destinations.filter(d => d.id !== 'Repeater')
  destinations = sortBy(destinations, ['id'])
  destinations = sortedUniqBy(destinations, 'id')

  return destinations
}
