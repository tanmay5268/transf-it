import {prisma} from "../../../../packages/db/index";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt";

const isProd = process.env.NODE_ENV === "production";
const appCookiePrefix = "user-app";
const cookieName = (name: string) => `${appCookiePrefix}.${name}`;

export const authOptions = {
    providers: [
      CredentialsProvider({
          name: 'Credentials',
          credentials: {
            phone: { label: "Phone number", type: "text", placeholder: "1231231231", required: true },
            password: { label: "Password", type: "password", required: true }
          },
          // TODO: User credentials type from next-auth instead of any
          async authorize(credentials: any) {
            // Do zod validation, OTP validation here
            console.log(`These are credentials: ${JSON.stringify(credentials)}`);

            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const existingUser = await prisma.user.findFirst({
                where: {
                    number: credentials.phone
                }
            });

            if (existingUser) {
                const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
                if (passwordValidation) {
                    return {
                        id: existingUser.id.toString(),
                        name: existingUser.name,
                        email: existingUser.number
                    }
                }
                return null;
            }

            try {
                const user = await prisma.user.create({
                    data: {
                        number: credentials.phone,
                        password: hashedPassword
                    }
                });

                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.number
                }
            } catch(e) {
                console.error(e);
            }

            return null
          },
        })
    ],
    // Use the same secret across apps running on the same domain (e.g. localhost)
    // so session decryption remains stable.
    secret: process.env.NEXTAUTH_SECRET || "secret",
    useSecureCookies: isProd,
    // Avoid cookie name collisions with other NextAuth apps on the same domain.
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
    },
    callbacks: {
        // TODO: can u fix the type here? Using any is bad
        async session({ token, session }: any) {
            session.user.id = token.sub

            return session
        }
    }
  }
