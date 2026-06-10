import { relations, sql } from "drizzle-orm"
import {
  customType,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { user } from "./auth"

// Postgres full-text search vector. Drizzle has no native tsvector type.
const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector"
  },
})

export const sourceModel = pgEnum("source_model", [
  "claude",
  "chatgpt",
  "gemini",
  "grok",
  "mistral",
  "perplexity",
  "deepseek",
  "other",
])

export const solutions = pgTable(
  "solutions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    questionTitle: text("question_title").notNull(),
    questionBody: text("question_body").notNull(),
    answerBody: text("answer_body").notNull(),
    sourceModel: sourceModel("source_model").notNull().default("other"),
    rawTranscript: text("raw_transcript").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // Precomputed, STORED weighted search vector: title => A, bodies => B.
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce(question_title, '')), 'A') || setweight(to_tsvector('english', coalesce(question_body, '') || ' ' || coalesce(answer_body, '')), 'B')`
    ),
  },
  (table) => [
    index("solutions_search_idx").using("gin", table.searchVector),
    // Dedup guard: a user can't publish the same transcript twice. Hash the
    // transcript since raw text is too large for a btree index entry.
    uniqueIndex("solutions_user_transcript_unique").on(
      table.userId,
      sql`md5(${table.rawTranscript})`
    ),
  ]
)

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
})

export const solutionTags = pgTable(
  "solution_tags",
  {
    solutionId: uuid("solution_id")
      .notNull()
      .references(() => solutions.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.solutionId, table.tagId] })]
)

export const codeSnippets = pgTable("code_snippets", {
  id: uuid("id").primaryKey().defaultRandom(),
  solutionId: uuid("solution_id")
    .notNull()
    .references(() => solutions.id, { onDelete: "cascade" }),
  language: text("language"),
  content: text("content").notNull(),
  position: integer("position").notNull().default(0),
})

export const solutionsRelations = relations(solutions, ({ one, many }) => ({
  author: one(user, {
    fields: [solutions.userId],
    references: [user.id],
  }),
  solutionTags: many(solutionTags),
  codeSnippets: many(codeSnippets),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  solutionTags: many(solutionTags),
}))

export const solutionTagsRelations = relations(solutionTags, ({ one }) => ({
  solution: one(solutions, {
    fields: [solutionTags.solutionId],
    references: [solutions.id],
  }),
  tag: one(tags, {
    fields: [solutionTags.tagId],
    references: [tags.id],
  }),
}))

export const codeSnippetsRelations = relations(codeSnippets, ({ one }) => ({
  solution: one(solutions, {
    fields: [codeSnippets.solutionId],
    references: [solutions.id],
  }),
}))
