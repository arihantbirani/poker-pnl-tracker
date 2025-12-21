"use client";

import { useSessionContext } from "@/contexts/SessionContext";

export function useSessions() {
    return useSessionContext();
}
