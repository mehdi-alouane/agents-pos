/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as TripsImport } from './routes/trips'
import { Route as LayoutImport } from './routes/_layout'
import { Route as IndexImport } from './routes/index'
import { Route as TripsTripIdImport } from './routes/trips.$tripId'

// Create/Update Routes

const TripsRoute = TripsImport.update({
  id: '/trips',
  path: '/trips',
  getParentRoute: () => rootRoute,
} as any)

const LayoutRoute = LayoutImport.update({
  id: '/_layout',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const TripsTripIdRoute = TripsTripIdImport.update({
  id: '/$tripId',
  path: '/$tripId',
  getParentRoute: () => TripsRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/_layout': {
      id: '/_layout'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof LayoutImport
      parentRoute: typeof rootRoute
    }
    '/trips': {
      id: '/trips'
      path: '/trips'
      fullPath: '/trips'
      preLoaderRoute: typeof TripsImport
      parentRoute: typeof rootRoute
    }
    '/trips/$tripId': {
      id: '/trips/$tripId'
      path: '/$tripId'
      fullPath: '/trips/$tripId'
      preLoaderRoute: typeof TripsTripIdImport
      parentRoute: typeof TripsImport
    }
  }
}

// Create and export the route tree

interface TripsRouteChildren {
  TripsTripIdRoute: typeof TripsTripIdRoute
}

const TripsRouteChildren: TripsRouteChildren = {
  TripsTripIdRoute: TripsTripIdRoute,
}

const TripsRouteWithChildren = TripsRoute._addFileChildren(TripsRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '': typeof LayoutRoute
  '/trips': typeof TripsRouteWithChildren
  '/trips/$tripId': typeof TripsTripIdRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '': typeof LayoutRoute
  '/trips': typeof TripsRouteWithChildren
  '/trips/$tripId': typeof TripsTripIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/_layout': typeof LayoutRoute
  '/trips': typeof TripsRouteWithChildren
  '/trips/$tripId': typeof TripsTripIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '' | '/trips' | '/trips/$tripId'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '' | '/trips' | '/trips/$tripId'
  id: '__root__' | '/' | '/_layout' | '/trips' | '/trips/$tripId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  LayoutRoute: typeof LayoutRoute
  TripsRoute: typeof TripsRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  LayoutRoute: LayoutRoute,
  TripsRoute: TripsRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_layout",
        "/trips"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_layout": {
      "filePath": "_layout.tsx"
    },
    "/trips": {
      "filePath": "trips.tsx",
      "children": [
        "/trips/$tripId"
      ]
    },
    "/trips/$tripId": {
      "filePath": "trips.$tripId.tsx",
      "parent": "/trips"
    }
  }
}
ROUTE_MANIFEST_END */
