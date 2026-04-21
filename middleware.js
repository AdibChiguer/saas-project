// middleware.js (at project root, next to package.json)
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // redirects here if not authenticated
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};