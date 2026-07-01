import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack";

// Stack Auth handles its own auth routes (OAuth callback, sign-out, account
// settings, …) under /handler/*.
export default function Handler(props: unknown) {
  return <StackHandler fullPage app={stackServerApp} routeProps={props} />;
}
