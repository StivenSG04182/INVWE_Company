import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Aquí iría la lógica para verificar las credenciales
                // Por ejemplo, buscar el usuario en la base de datos y verificar la contraseña
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user) {
                    return null;
                }

                // En un entorno real, aquí verificarías la contraseña con bcrypt o similar
                // Por ahora, simplemente devolvemos el usuario
                return user;
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
            }
            return session;
        },
        async jwt({ token, user }) {
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: token.email as string,
                },
            });

            if (!dbUser) {
                if (user) {
                    token.id = user.id;
                }
                return token;
            }

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
            };
        },
    },
    pages: {
        signIn: "/sign-in",
    },
    secret: process.env.NEXTAUTH_SECRET,
};