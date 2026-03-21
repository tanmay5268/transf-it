import GoogleProvider from "next-auth/providers/google";
import { prisma as db } from "@repo/db/client";

const isProd = process.env.NODE_ENV === "production";
const appCookiePrefix = "merchant-app";
const cookieName = (name: string) => `${appCookiePrefix}.${name}`;

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        })
    ],
    callbacks: {
      async signIn({ user, account }: {
        user: {
          email: string;
          name: string
        },
        account: {
          provider: "google" | "github"
        }
      }) {
        console.log("hi signin")
        if (!user || !user.email) {
          return false;
        }

        await db.merchant.upsert({
          select: {
            id: true
          },
          where: {
            email: user.email
          },
          create: {
            email: user.email,
            name: user.name,
            auth_type: account.provider === "google" ? "Google" : "Github" // Use a prisma type here
          },
          update: {
            name: user.name,
            auth_type: account.provider === "google" ? "Google" : "Github" // Use a prisma type here
          }
        });

        return true;
      }
    },
  secret: process.env.NEXTAUTH_SECRET || "secret",
  useSecureCookies: isProd,
  cookies: {
    sessionToken: {
      name: cookieName("next-auth.session-token"),
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd
      }
    },
    callbackUrl: {
      name: cookieName("next-auth.callback-url"),
      options: {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: isProd
      }
    },
    csrfToken: {
      name: cookieName("next-auth.csrf-token"),
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd
      }
    },
    pkceCodeVerifier: {
      name: cookieName("next-auth.pkce.code_verifier"),
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd
      }
    },
    state: {
      name: cookieName("next-auth.state"),
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd
      }
    },
    nonce: {
      name: cookieName("next-auth.nonce"),
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd
      }
    }
  }
  }
