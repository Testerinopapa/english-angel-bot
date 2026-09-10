import { maskSender } from "@/lib/talknbit.server";

export type RoomSession = {
  id: string;
  code: string;
  participant1: string;
  participant2?: string | null;
  status: "waiting" | "active" | "closed";
  updatedAt: string;
};

// In-memory fallback cache to ensure zero-latency relaying across server turns
const memoryRooms = new Map<string, RoomSession>();
const phoneToCode = new Map<string, string>();

async function getAdminClient() {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return supabaseAdmin;
  } catch {
    return null;
  }
}

/**
 * Join or create a shared Practice Room by code.
 */
export async function joinPracticeRoom(
  phone: string,
  rawCode: string,
): Promise<{
  success: boolean;
  message: string;
  partnerPhone?: string;
  isNew: boolean;
  roomCode: string;
}> {
  const code = rawCode.trim().toUpperCase().slice(0, 30);
  if (!code) {
    return { success: false, message: "Please provide a valid room code (e.g. /join 101)", isNew: false, roomCode: "" };
  }

  // Leave any existing room first
  await leavePracticeRoom(phone);

  const admin = await getAdminClient();

  if (admin) {
    try {
      // Check if there is an active waiting room with this code
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: waitingRooms } = await (admin as any)
        .from("practice_rooms")
        .select("id, room_code, participant_1, participant_2, status")
        .eq("room_code", code)
        .eq("status", "waiting")
        .order("created_at", { ascending: false })
        .limit(1);

      if (waitingRooms && waitingRooms.length > 0) {
        const room = waitingRooms[0];
        if (room.participant_1 !== phone) {
          // Connect as participant 2
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (admin as any)
            .from("practice_rooms")
            .update({
              participant_2: phone,
              status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("id", room.id);

          const session: RoomSession = {
            id: room.id,
            code,
            participant1: room.participant_1,
            participant2: phone,
            status: "active",
            updatedAt: new Date().toISOString(),
          };
          memoryRooms.set(code, session);
          phoneToCode.set(room.participant_1, code);
          phoneToCode.set(phone, code);

          return {
            success: true,
            message: "Connected to your study partner!",
            partnerPhone: room.participant_1,
            isNew: false,
            roomCode: code,
          };
        }
      }

      // Create new waiting room
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newRoom, error: insertError } = await (admin as any)
        .from("practice_rooms")
        .insert({
          room_code: code,
          participant_1: phone,
          status: "waiting",
        })
        .select("id")
        .single();

      if (!insertError && newRoom) {
        const session: RoomSession = {
          id: newRoom.id,
          code,
          participant1: phone,
          participant2: null,
          status: "waiting",
          updatedAt: new Date().toISOString(),
        };
        memoryRooms.set(code, session);
        phoneToCode.set(phone, code);

        return {
          success: true,
          message: `Room #${code} created!`,
          isNew: true,
          roomCode: code,
        };
      }
    } catch (err) {
      console.warn("DB room error, using in-memory store:", err);
    }
  }

  // Fallback in-memory logic
  const existing = memoryRooms.get(code);
  if (existing && existing.status === "waiting" && existing.participant1 !== phone) {
    existing.participant2 = phone;
    existing.status = "active";
    existing.updatedAt = new Date().toISOString();
    phoneToCode.set(phone, code);
    return {
      success: true,
      message: "Connected to your study partner!",
      partnerPhone: existing.participant1,
      isNew: false,
      roomCode: code,
    };
  }

  const newSession: RoomSession = {
    id: `mem_${code}`,
    code,
    participant1: phone,
    participant2: null,
    status: "waiting",
    updatedAt: new Date().toISOString(),
  };
  memoryRooms.set(code, newSession);
  phoneToCode.set(phone, code);

  return {
    success: true,
    message: `Room #${code} created!`,
    isNew: true,
    roomCode: code,
  };
}

/**
 * Get active partner phone number for message relay.
 */
export async function getPartnerPhone(
  phone: string,
): Promise<{ inRoom: boolean; partnerPhone?: string; roomCode?: string }> {
  // Check memory cache first
  const memCode = phoneToCode.get(phone);
  if (memCode) {
    const session = memoryRooms.get(memCode);
    if (session && session.status === "active") {
      const partner = session.participant1 === phone ? session.participant2 : session.participant1;
      if (partner) {
        return { inRoom: true, partnerPhone: partner, roomCode: session.code };
      }
    }
  }

  const admin = await getAdminClient();
  if (admin) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: p1Rooms } = await (admin as any)
        .from("practice_rooms")
        .select("id, room_code, participant_1, participant_2, status")
        .eq("participant_1", phone)
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (p1Rooms && p1Rooms.length > 0 && p1Rooms[0].participant_2) {
        const r = p1Rooms[0];
        phoneToCode.set(phone, r.room_code);
        phoneToCode.set(r.participant_2, r.room_code);
        return { inRoom: true, partnerPhone: r.participant_2, roomCode: r.room_code };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: p2Rooms } = await (admin as any)
        .from("practice_rooms")
        .select("id, room_code, participant_1, participant_2, status")
        .eq("participant_2", phone)
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (p2Rooms && p2Rooms.length > 0) {
        const r = p2Rooms[0];
        phoneToCode.set(phone, r.room_code);
        phoneToCode.set(r.participant_1, r.room_code);
        return { inRoom: true, partnerPhone: r.participant_1, roomCode: r.room_code };
      }
    } catch (err) {
      console.warn("DB getPartnerPhone error:", err);
    }
  }

  return { inRoom: false };
}

/**
 * Leave any active or waiting practice room.
 */
export async function leavePracticeRoom(
  phone: string,
): Promise<{ left: boolean; partnerPhone?: string; roomCode?: string }> {
  let partnerPhone: string | undefined;
  let roomCode: string | undefined;

  const memCode = phoneToCode.get(phone);
  if (memCode) {
    const session = memoryRooms.get(memCode);
    if (session && session.status !== "closed") {
      session.status = "closed";
      roomCode = session.code;
      partnerPhone = session.participant1 === phone ? session.participant2 ?? undefined : session.participant1;
      if (session.participant2) phoneToCode.delete(session.participant2);
      phoneToCode.delete(session.participant1);
    }
    phoneToCode.delete(phone);
  }

  const admin = await getAdminClient();
  if (admin) {
    try {
      // Find active rooms
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: activeRooms } = await (admin as any)
        .from("practice_rooms")
        .select("id, room_code, participant_1, participant_2")
        .or(`participant_1.eq.${phone},participant_2.eq.${phone}`)
        .in("status", ["waiting", "active"]);

      if (activeRooms && activeRooms.length > 0) {
        for (const r of activeRooms) {
          roomCode = r.room_code;
          const other = r.participant_1 === phone ? r.participant_2 : r.participant_1;
          if (other) partnerPhone = other;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (admin as any)
            .from("practice_rooms")
            .update({ status: "closed", updated_at: new Date().toISOString() })
            .eq("id", r.id);
        }
      }
    } catch (err) {
      console.warn("DB leavePracticeRoom error:", err);
    }
  }

  return {
    left: Boolean(roomCode),
    ...(partnerPhone ? { partnerPhone } : {}),
    ...(roomCode ? { roomCode } : {}),
  };
}

/**
 * Get the current room status for a user.
 */
export async function getRoomStatus(
  phone: string,
): Promise<{ inRoom: boolean; waiting: boolean; roomCode?: string; partnerMasked?: string }> {
  const partner = await getPartnerPhone(phone);
  if (partner.inRoom && partner.partnerPhone) {
    return {
      inRoom: true,
      waiting: false,
      ...(partner.roomCode ? { roomCode: partner.roomCode } : {}),
      partnerMasked: maskSender(partner.partnerPhone),
    };
  }

  const memCode = phoneToCode.get(phone);
  if (memCode) {
    const session = memoryRooms.get(memCode);
    if (session && session.status === "waiting") {
      return { inRoom: false, waiting: true, roomCode: session.code };
    }
  }

  return { inRoom: false, waiting: false };
}
