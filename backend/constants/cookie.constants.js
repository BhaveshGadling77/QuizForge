export const cookieSettings = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || false,
      sameSite: process.env.NODE_ENV === "production" ? "None" :"lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    }