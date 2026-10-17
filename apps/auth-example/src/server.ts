/**
 * A fake auth API that runs in the browser, so this example works without a backend. It
 * implements the contract `restAdapter` expects (bearer tokens with rotation, 202 next
 * steps, field errors) and keeps its data in localStorage, so every tab sees one "server".
 * Emails land in a dev inbox instead of being sent.
 */

interface User {
  id: string
  email: string
  password: string
  name: string
  emailVerified: boolean
  twoFactor: boolean
  roles: string[]
  permissions: string[]
  organizations: { id: string; name: string; role: string }[]
}

export interface InboxMessage {
  id: string
  to: string
  subject: string
  /** A code to type, or a link to open. */
  code?: string
  link?: string
  at: number
}

interface Db {
  users: User[]
  codes: { kind: 'verify' | 'two-factor' | 'reset'; email: string; value: string }[]
  access: Record<string, { userId: string; expiresAt: number }>
  refresh: Record<string, string>
  pendingSecondFactor: string | null
  activeOrganization: Record<string, string>
  inbox: InboxMessage[]
}

const KEY = 'auth-example-db'
const ACCESS_TTL = 10 * 60_000
export const INBOX_EVENT = 'auth-example:inbox'

const seedUsers: User[] = [
  {
    id: 'u_ada',
    email: 'ada@example.com',
    password: 'correct horse',
    name: 'Ada Lovelace',
    emailVerified: true,
    twoFactor: false,
    roles: ['admin'],
    permissions: ['*'],
    organizations: [
      { id: 'org_engines', name: 'Analytical Engines', role: 'owner' },
      { id: 'org_difference', name: 'Difference Ltd', role: 'member' },
    ],
  },
  {
    id: 'u_grace',
    email: 'grace@example.com',
    password: 'cobol rules',
    name: 'Grace Hopper',
    emailVerified: true,
    twoFactor: true,
    roles: ['member'],
    permissions: ['invoices:read'],
    organizations: [{ id: 'org_navy', name: 'Navy Labs', role: 'member' }],
  },
]

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Db
  } catch {}
  return {
    users: seedUsers,
    codes: [],
    access: {},
    refresh: {},
    pendingSecondFactor: null,
    activeOrganization: {},
    inbox: [],
  }
}

function save(db: Db) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

/** Clears all data back to the seed users. */
export function resetServer() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event(INBOX_EVENT))
}

export function readInbox(): InboxMessage[] {
  return load().inbox
}

const random = (length = 24) =>
  Array.from(crypto.getRandomValues(new Uint8Array(length)), (b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, length)
const sixDigits = () =>
  String(crypto.getRandomValues(new Uint32Array(1))[0]! % 1_000_000).padStart(6, '0')

function mail(db: Db, message: Omit<InboxMessage, 'id' | 'at'>) {
  db.inbox.unshift({ ...message, id: random(8), at: Date.now() })
  db.inbox = db.inbox.slice(0, 20)
}

function json(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function sessionBody(db: Db, user: User, tokens?: { accessToken: string; refreshToken: string }) {
  const accessToken = tokens?.accessToken
  const expiresAt = accessToken ? db.access[accessToken]?.expiresAt : undefined
  return {
    user: { id: user.id, email: user.email, name: user.name, emailVerified: user.emailVerified },
    roles: user.roles,
    permissions: user.permissions,
    organizations: user.organizations,
    activeOrganizationId: db.activeOrganization[user.id] ?? user.organizations[0]?.id,
    ...(expiresAt && { expiresAt }),
    ...tokens,
  }
}

function issue(db: Db, user: User) {
  const accessToken = random()
  const refreshToken = random()
  db.access[accessToken] = { userId: user.id, expiresAt: Date.now() + ACCESS_TTL }
  db.refresh[refreshToken] = user.id
  return sessionBody(db, user, { accessToken, refreshToken })
}

function bearerUser(db: Db, request: Request): User | null {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '')
  const entry = token ? db.access[token] : undefined
  if (!entry || entry.expiresAt < Date.now()) return null
  return db.users.find((u) => u.id === entry.userId) ?? null
}

const invoices = [
  { id: 'INV-1042', customer: 'Northwind', status: 'paid', total: 1240 },
  { id: 'INV-1043', customer: 'Globex', status: 'open', total: 86.5 },
  { id: 'INV-1044', customer: 'Initech', status: 'overdue', total: 12900.75 },
  { id: 'INV-1045', customer: 'Umbrella', status: 'open', total: 410 },
]

async function handle(path: string, request: Request): Promise<Response> {
  const db = load()
  const body =
    request.method === 'GET'
      ? {}
      : ((await request.json().catch(() => ({}))) as Record<string, string>)
  const email = body.email?.trim().toLowerCase()
  const user = email ? db.users.find((u) => u.email === email) : undefined
  const route = `${request.method} ${path}`

  const done = (response: Response) => {
    save(db)
    if (db.inbox.length) window.dispatchEvent(new Event(INBOX_EVENT))
    return response
  }

  switch (route) {
    case 'GET /auth/session': {
      const current = bearerUser(db, request)
      return current ? json(200, sessionBody(db, current)) : json(401, { message: 'Signed out.' })
    }
    case 'POST /auth/sign-in': {
      if (!user || user.password !== body.password)
        return json(401, { message: 'That email and password don’t match.' })
      if (!user.emailVerified) {
        const value = sixDigits()
        db.codes.push({ kind: 'verify', email: user.email, value })
        mail(db, { to: user.email, subject: 'Confirm your email', code: value })
        return done(json(202, { status: 'needs-verification', email: user.email }))
      }
      if (user.twoFactor) {
        const value = sixDigits()
        db.pendingSecondFactor = user.id
        db.codes.push({ kind: 'two-factor', email: user.email, value })
        mail(db, { to: user.email, subject: 'Your sign-in code', code: value })
        return done(json(202, { status: 'needs-second-factor' }))
      }
      return done(json(200, issue(db, user)))
    }
    case 'POST /auth/sign-up': {
      if (user)
        return json(409, {
          message: 'An account with this email already exists.',
          errors: { email: 'An account with this email already exists. Sign in instead.' },
        })
      if (!email || (body.password ?? '').length < 8)
        return json(422, { errors: { password: 'Use at least 8 characters.' } })
      const created: User = {
        id: `u_${random(8)}`,
        email,
        password: body.password ?? '',
        name: body.name ?? email,
        emailVerified: false,
        twoFactor: false,
        roles: ['member'],
        permissions: ['invoices:read'],
        organizations: [
          { id: `org_${random(6)}`, name: `${body.name || 'My'}’s workspace`, role: 'owner' },
        ],
      }
      db.users.push(created)
      const value = sixDigits()
      db.codes.push({ kind: 'verify', email, value })
      mail(db, { to: email, subject: 'Confirm your email', code: value })
      return done(json(202, { status: 'needs-verification', email }))
    }
    case 'POST /auth/verify': {
      const found = db.codes.find(
        (c) => c.kind === 'verify' && c.email === email && c.value === body.code,
      )
      if (!found || !user)
        return json(422, {
          message: 'That code isn’t right.',
          errors: { code: 'That code isn’t right. Check the email and try again.' },
        })
      db.codes = db.codes.filter((c) => c !== found)
      user.emailVerified = true
      return done(json(200, issue(db, user)))
    }
    case 'POST /auth/verify/resend': {
      if (user && !user.emailVerified) {
        const value = sixDigits()
        db.codes.push({ kind: 'verify', email: user.email, value })
        mail(db, { to: user.email, subject: 'Confirm your email', code: value })
      }
      return done(json(204))
    }
    case 'POST /auth/two-factor': {
      const pending = db.users.find((u) => u.id === db.pendingSecondFactor)
      const found =
        pending &&
        db.codes.find(
          (c) => c.kind === 'two-factor' && c.email === pending.email && c.value === body.code,
        )
      if (!pending || !found)
        return json(422, {
          message: 'That code isn’t right.',
          errors: { code: 'That code isn’t right. Use the newest code.' },
        })
      db.codes = db.codes.filter((c) => c !== found)
      db.pendingSecondFactor = null
      return done(json(200, issue(db, pending)))
    }
    case 'POST /auth/refresh': {
      const userId = body.refreshToken ? db.refresh[body.refreshToken] : undefined
      const owner = db.users.find((u) => u.id === userId)
      if (!owner || !body.refreshToken) return json(401, { message: 'Session expired.' })
      // Rotation: a refresh token works once.
      delete db.refresh[body.refreshToken]
      return done(json(200, issue(db, owner)))
    }
    case 'POST /auth/sign-out': {
      const token = request.headers.get('Authorization')?.replace(/^Bearer /, '')
      if (token) delete db.access[token]
      return done(json(204))
    }
    case 'POST /auth/password/forgot': {
      // Same answer whether or not the account exists.
      if (user) {
        const value = random()
        db.codes.push({ kind: 'reset', email: user.email, value })
        mail(db, {
          to: user.email,
          subject: 'Reset your password',
          link: `${import.meta.env.BASE_URL}reset-password?token=${value}`,
        })
      }
      return done(json(204))
    }
    case 'POST /auth/password/reset': {
      const found = db.codes.find((c) => c.kind === 'reset' && c.value === body.token)
      const owner = found && db.users.find((u) => u.email === found.email)
      if (!found || !owner)
        return json(410, { message: 'This reset link has expired. Request a new one.' })
      db.codes = db.codes.filter((c) => c !== found)
      owner.password = body.password ?? owner.password
      return done(json(204))
    }
    case 'POST /auth/organization': {
      const current = bearerUser(db, request)
      if (!current) return json(401, { message: 'Signed out.' })
      db.activeOrganization[current.id] = body.organizationId ?? ''
      return done(json(200, sessionBody(db, current)))
    }
    case 'GET /invoices': {
      const current = bearerUser(db, request)
      return current ? json(200, invoices) : json(401, { message: 'Signed out.' })
    }
    case 'POST /dev/expire-session': {
      // Revoke every token: the next API call fails and refreshing can't recover.
      db.access = {}
      db.refresh = {}
      return done(json(204))
    }
    default:
      return json(404, { message: `No route for ${route}` })
  }
}

/** Routes `fetch('/api/...')` to the fake server, with a little latency. */
export function installFakeServer() {
  const realFetch = window.fetch.bind(window)
  const apiPrefix = `${import.meta.env.BASE_URL}api/`
  window.fetch = async (input, init) => {
    const request = new Request(input, init)
    const url = new URL(request.url)
    if (url.origin !== location.origin || !url.pathname.startsWith(apiPrefix))
      return realFetch(input, init)
    await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 250))
    return handle(`/${url.pathname.slice(apiPrefix.length)}`, request)
  }
}
