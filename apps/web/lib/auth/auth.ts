import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import "./types" // Import type augmentations

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:8080/api"

interface BackendLoginResponse {
  data: {
    user: {
      id: number
      uuid: string
      email: string
      fullName: string
      phoneNumber: string | null
      companyId: string | null
      branchId: string | null
      ownedCompanyId: string | null
      activeStatus: "active" | "inactive" | "suspended"
      isEmailVerified: boolean
      isPhoneVerified: boolean
      isAdministrator: boolean
      roles: Array<{
        id: number
        uuid: string
        name: string
        code: string
        permissions: Array<{
          action: string
          subject: string
        }>
      }>
      rolesIds: number[]
      createdAt: string
      updatedAt: string
    }
    token: {
      accessToken: string
      expiresIn: number
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi")
        }

        try {
          const response = await fetch(`${INTERNAL_API_URL}/v1/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || "Login gagal")
          }

          const loginResponse = data as BackendLoginResponse

          // Return the user object that will be stored in the JWT
          return {
            id: String(loginResponse.data.user.id),
            uuid: loginResponse.data.user.uuid,
            email: loginResponse.data.user.email,
            fullName: loginResponse.data.user.fullName,
            phoneNumber: loginResponse.data.user.phoneNumber,
            companyId: loginResponse.data.user.companyId,
            branchId: loginResponse.data.user.branchId,
            ownedCompanyId: loginResponse.data.user.ownedCompanyId,
            activeStatus: loginResponse.data.user.activeStatus,
            isEmailVerified: loginResponse.data.user.isEmailVerified,
            isPhoneVerified: loginResponse.data.user.isPhoneVerified,
            isAdministrator: loginResponse.data.user.isAdministrator,
            roles: loginResponse.data.user.roles,
            rolesIds: loginResponse.data.user.rolesIds,
            accessToken: loginResponse.data.token.accessToken,
            expiresIn: loginResponse.data.token.expiresIn,
          }
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message)
          }
          throw new Error("Terjadi kesalahan saat login")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          id: Number(user.id),
          uuid: user.uuid,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          companyId: user.companyId,
          branchId: user.branchId,
          ownedCompanyId: user.ownedCompanyId,
          activeStatus: user.activeStatus,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          isAdministrator: user.isAdministrator,
          roles: user.roles,
          rolesIds: user.rolesIds,
          accessToken: user.accessToken,
          expiresIn: user.expiresIn,
          // Calculate when the access token expires
          accessTokenExpires: Date.now() + user.expiresIn * 1000,
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires || 0)) {
        return token
      }

      // Access token has expired, mark it as an error
      // The backend doesn't have a refresh token endpoint, so we'll require re-login
      return {
        ...token,
        error: "RefreshAccessTokenError" as const,
      }
    },
    async session({ session, token }) {
      // Send properties to the client
      session.user = {
        id: token.id,
        uuid: token.uuid,
        email: token.email,
        fullName: token.fullName,
        phoneNumber: token.phoneNumber,
        companyId: token.companyId,
        branchId: token.branchId,
        ownedCompanyId: token.ownedCompanyId,
        activeStatus: token.activeStatus,
        isEmailVerified: token.isEmailVerified,
        isPhoneVerified: token.isPhoneVerified,
        isAdministrator: token.isAdministrator,
        roles: token.roles,
        rolesIds: token.rolesIds,
        createdAt: "",
        updatedAt: "",
      }
      session.accessToken = token.accessToken
      session.expiresIn = token.expiresIn

      if (token.error) {
        session.error = token.error
      }

      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}
