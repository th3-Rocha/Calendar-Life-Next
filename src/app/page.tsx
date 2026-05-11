"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    let uuid = localStorage.getItem("calendarLifeUserId");
    if (!uuid) {
      uuid = uuidv4();
      localStorage.setItem("calendarLifeUserId", uuid);
    }
    router.replace(`/${uuid}`);
  }, [router]);

  return (
    <div style={{ padding: "2rem", color: "white", textAlign: "center" }}>
      Carregando seu calendário...
    </div>
  );
}
