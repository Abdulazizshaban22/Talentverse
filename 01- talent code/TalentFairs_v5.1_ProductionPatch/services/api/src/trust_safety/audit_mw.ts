// services/api/src/trust_safety/audit_mw.ts
import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function audit(action: string, entity: string, entityId: string, details: any, req: Request) {
  const actorId = (req as any).user?.id || "anonymous";
  const actorRole = (req as any).user?.role || "unknown";
  await prisma.auditLog.create({ data: { actorId, actorRole, action, entity, entityId, details } });
}

export function auditMiddleware(action: string, entity: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
      audit(action, entity, req.params.id || "-", { status: res.statusCode, body: req.body }, req).catch(()=>{});
    });
    next();
  };
}
