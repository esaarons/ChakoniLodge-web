import type { ComponentPropsWithoutRef } from "react";

export function Container({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={`mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12 ${className}`} {...props} />;
}
