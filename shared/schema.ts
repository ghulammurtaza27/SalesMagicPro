import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  employeeCount: text("employee_count"),
  budgetRange: text("budget_range"),
  timeline: text("timeline"),
  interestArea: text("interest_area"),
  notes: text("notes"),
  aiScore: integer("ai_score").default(0),
  priority: text("priority").default("medium"), // low, medium, high
  status: text("status").default("new"), // new, qualified, contacted, nurturing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  companyName: text("company_name").notNull(),
  value: integer("value").notNull(), // in cents
  stage: text("stage").notNull(), // qualified, proposal, negotiation, closing, won, lost
  probability: integer("probability").default(25), // percentage
  closeDate: timestamp("close_date"),
  notes: text("notes"),
  lastContactDate: timestamp("last_contact_date"),
  healthScore: integer("health_score").default(50), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id),
  leadId: integer("lead_id").references(() => leads.id),
  type: text("type").notNull(), // call, email, meeting, note
  description: text("description").notNull(),
  outcome: text("outcome"),
  nextSteps: text("next_steps"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const callNotes = pgTable("call_notes", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id),
  leadId: integer("lead_id").references(() => leads.id),
  callDuration: integer("call_duration"), // in minutes
  summary: text("summary").notNull(),
  keyPoints: text("key_points").array(),
  objections: text("objections").array(),
  nextSteps: text("next_steps"),
  sentiment: text("sentiment"), // positive, neutral, negative
  coachingNotes: text("coaching_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  aiScore: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertCallNoteSchema = createInsertSchema(callNotes).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertCallNote = z.infer<typeof insertCallNoteSchema>;
export type CallNote = typeof callNotes.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
