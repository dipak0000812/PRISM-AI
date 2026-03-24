import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import GitLab from "next-auth/providers/gitlab"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GitLab({
      clientId: process.env.GITLAB_CLIENT_ID!,
      clientSecret: process.env.GITLAB_CLIENT_SECRET!,
      checks: ["state"],
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email && 
            credentials?.password && 
            (credentials.password as string).length >= 6) {
          return {
            id: credentials.email as string,
            email: credentials.email as string,
            name: (credentials.email as string).split('@')[0],
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const protectedPaths = ['/dashboard', '/mr', '/graph', '/settings']
      const isProtected = protectedPaths.some(path => 
        nextUrl.pathname.startsWith(path)
      )
      if (isProtected) {
        if (isLoggedIn) return true
        return Response.redirect(new URL('/login', nextUrl))
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.provider = account.provider
      }
      return token
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  useSecureCookies: false,
})
