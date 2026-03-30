import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ────────────────────────────────────────────────────
const SUPA_URL = "https://zqnqvbpigdltyogvfoom.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbnF2YnBpZ2RsdHlvZ3Zmb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2OTgyNDgsImV4cCI6MjA5MDI3NDI0OH0.8rO296NL6l07LEybaQkvkgYnwEoTzKvtvItRnLoTN_Y";
const supabase = createClient(SUPA_URL, SUPA_KEY);

// DB column mapping (snake_case ↔ camelCase)
function fromDB(r) {
  return { id: r.id, symbol: r.symbol, type: r.type, action: r.action, strike: Number(r.strike), premium: Number(r.premium), openDate: r.open_date, expDate: r.exp_date, closeDate: r.close_date, exitPrice: r.exit_price != null ? Number(r.exit_price) : null, contracts: r.contracts || 1, fees: Number(r.fees || 0), account: r.account, notes: r.notes, status: r.status, createdAt: r.created_at };
}
function toDB(t, userId) {
  return { id: t.id, user_id: userId, symbol: t.symbol, type: t.type, action: t.action, strike: t.strike, premium: t.premium, open_date: t.openDate, exp_date: t.expDate, close_date: t.closeDate, exit_price: t.exitPrice, contracts: t.contracts || 1, fees: t.fees || 0, account: t.account, notes: t.notes, status: t.status, created_at: t.createdAt };
}

async function loadTrades(userId) {
  const { data, error } = await supabase.from("trades").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) { console.error("Load error:", error); return []; }
  return (data || []).map(fromDB);
}
async function upsertTrade(trade, userId) {
  const { error } = await supabase.from("trades").upsert(toDB(trade, userId));
  if (error) console.error("Upsert error:", error);
}
async function removeTrade(id) {
  const { error } = await supabase.from("trades").delete().eq("id", id);
  if (error) console.error("Delete error:", error);
}
async function bulkInsert(trades, userId) {
  const rows = trades.map(t => toDB(t, userId));
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase.from("trades").upsert(rows.slice(i, i + BATCH));
    if (error) console.error("Bulk insert error:", error);
  }
}

const HIST = [{"id":"hist_162","symbol":"GME","type":"Call","action":"Sell","strike":27.0,"premium":0.21,"openDate":"2026-01-22","expDate":"2026-02-06","contracts":1,"account":"Schwab","notes":"","fees":1.37,"status":"Closed","createdAt":1700000000000,"exitPrice":0.14,"closeDate":"2026-02-04"},{"id":"hist_161","symbol":"GME","type":"Call","action":"Buy","strike":23.0,"premium":3.0,"openDate":"2025-06-12","expDate":"2025-08-15","contracts":1,"account":"Schwab","notes":"","fees":1.37,"status":"Open","createdAt":1700000001000,"exitPrice":null,"closeDate":null},{"id":"hist_160","symbol":"GME","type":"Call","action":"Sell","strike":50.0,"premium":0.71,"openDate":"2025-05-29","expDate":"2025-06-13","contracts":1,"account":"Schwab","notes":"","fees":1.37,"status":"Closed","createdAt":1700000002000,"exitPrice":0.13,"closeDate":"2025-06-10"},{"id":"hist_159","symbol":"GME","type":"Put","action":"Sell","strike":32.0,"premium":1.51,"openDate":"2025-05-27","expDate":"2025-06-06","contracts":1,"account":"Schwab","notes":"","fees":0.67,"status":"Closed","createdAt":1700000003000,"exitPrice":0.0,"closeDate":"2025-06-06"},{"id":"hist_158","symbol":"GME","type":"Put","action":"Sell","strike":28.5,"premium":0.79,"openDate":"2025-05-23","expDate":"2025-06-06","contracts":1,"account":"Schwab","notes":"","fees":1.37,"status":"Closed","createdAt":1700000004000,"exitPrice":0.43,"closeDate":"2025-05-27"},{"id":"hist_157","symbol":"GME","type":"Call","action":"Sell","strike":40.0,"premium":1.6,"openDate":"2025-05-22","expDate":"2025-06-13","contracts":1,"account":"Schwab","notes":"","fees":1.37,"status":"Closed","createdAt":1700000005000,"exitPrice":1.08,"closeDate":"2025-05-29"},{"id":"hist_156","symbol":"GME","type":"Call","action":"Sell","strike":40.0,"premium":0.33,"openDate":"2025-05-20","expDate":"2025-06-06","contracts":1,"account":"Schwab","notes":"","fees":0.67,"status":"Closed","createdAt":1700000006000,"exitPrice":1.7,"closeDate":"2025-05-27"},{"id":"hist_155","symbol":"GME","type":"Call","action":"Sell","strike":40.0,"premium":0.26,"openDate":"2025-05-12","expDate":"2025-05-23","contracts":1,"account":"Schwab","notes":"","fees":0.67,"status":"Closed","createdAt":1700000007000,"exitPrice":0.04,"closeDate":"2025-05-23"},{"id":"hist_154","symbol":"GME","type":"Call","action":"Sell","strike":32.0,"premium":0.25,"openDate":"2025-04-29","expDate":"2025-05-09","contracts":1,"account":"Schwab","notes":"","fees":0.67,"status":"Closed","createdAt":1700000008000,"exitPrice":0.01,"closeDate":"2025-05-09"},{"id":"hist_153","symbol":"GME","type":"Put","action":"Sell","strike":21.5,"premium":0.9,"openDate":"2025-04-03","expDate":"2025-04-11","contracts":1,"account":"Schwab","notes":"","fees":1.37,"status":"Closed","createdAt":1700000009000,"exitPrice":0.3,"closeDate":"2025-04-07"},{"id":"hist_152","symbol":"GME","type":"Call","action":"Buy","strike":22.0,"premium":5.0,"openDate":"2025-04-03","expDate":"2025-10-17","contracts":1,"account":"Schwab","notes":"","fees":1.37,"status":"Open","createdAt":1700000010000,"exitPrice":null,"closeDate":null},{"id":"hist_151","symbol":"GME","type":"Put","action":"Sell","strike":22.0,"premium":0.92,"openDate":"2025-03-28","expDate":"2025-04-04","contracts":1,"account":"Schwab","notes":"","fees":1.37,"status":"Closed","createdAt":1700000011000,"exitPrice":0.7,"closeDate":"2025-04-03"},{"id":"hist_150","symbol":"GME","type":"Call","action":"Sell","strike":40.0,"premium":0.39,"openDate":"2025-03-26","expDate":"2025-04-04","contracts":1,"account":"Schwab","notes":"","fees":1.37,"status":"Closed","createdAt":1700000012000,"exitPrice":0.1,"closeDate":"2025-03-27"},{"id":"hist_149","symbol":"GME","type":"Call","action":"Buy","strike":24.0,"premium":2.5,"openDate":"2025-03-10","expDate":"2025-04-25","contracts":1,"account":"Schwab","notes":"","fees":1.37,"status":"Closed","createdAt":1700000013000,"exitPrice":5.45,"closeDate":"2025-03-26"},{"id":"hist_148","symbol":"IBIT","type":"Call","action":"Sell","strike":55.0,"premium":0.23,"openDate":"2025-03-07","expDate":"2025-03-14","contracts":1,"account":"Schwab","notes":"","fees":0.66,"status":"Closed","createdAt":1700000014000,"exitPrice":0.0,"closeDate":"2025-03-14"},{"id":"hist_147","symbol":"IBIT","type":"Call","action":"Buy","strike":48.0,"premium":2.76,"openDate":"2025-02-27","expDate":"2025-04-04","contracts":1,"account":"Schwab","notes":"","fees":1.37,"status":"Closed","createdAt":1700000015000,"exitPrice":2.92,"closeDate":"2025-02-28"},{"id":"hist_146","symbol":"IBIT","type":"Call","action":"Buy","strike":48.0,"premium":2.73,"openDate":"2025-02-26","expDate":"2025-04-04","contracts":1,"account":"Schwab","notes":"","fees":1.37,"status":"Closed","createdAt":1700000016000,"exitPrice":3.2,"closeDate":"2025-02-27"},{"id":"hist_145","symbol":"GME","type":"Call","action":"Sell","strike":30.5,"premium":0.33,"openDate":"2025-02-20","expDate":"2025-02-28","contracts":1,"account":"Schwab","notes":"","fees":0.67,"status":"Closed","createdAt":1700000017000,"exitPrice":0.02,"closeDate":"2025-02-27"},{"id":"hist_144","symbol":"GME","type":"Call","action":"Buy","strike":26.0,"premium":5.35,"openDate":"2025-02-07","expDate":"2025-07-18","contracts":1,"account":"Schwab","notes":"","fees":1.32,"status":"Closed","createdAt":1700000018000,"exitPrice":7.95,"closeDate":"2025-05-23"},{"id":"hist_143","symbol":"GME","type":"Put","action":"Sell","strike":26.5,"premium":0.4,"openDate":"2025-01-30","expDate":"2025-02-07","contracts":1,"account":"Schwab","notes":"Assigned","fees":0.67,"status":"Closed","createdAt":1700000019000,"exitPrice":0.0,"closeDate":"2025-02-07"},{"id":"hist_142","symbol":"IBIT","type":"Call","action":"Sell","strike":70.0,"premium":0.32,"openDate":"2025-01-30","expDate":"2025-02-14","contracts":1,"account":"Schwab","notes":"","fees":0.67,"status":"Closed","createdAt":1700000020000,"exitPrice":0.01,"closeDate":"2025-02-10"},{"id":"hist_141","symbol":"GME","type":"Put","action":"Sell","strike":26.0,"premium":0.25,"openDate":"2025-01-23","expDate":"2025-01-31","contracts":1,"account":"Schwab","notes":"","fees":1.32,"status":"Closed","createdAt":1700000021000,"exitPrice":0.19,"closeDate":"2025-01-27"},{"id":"hist_140","symbol":"IBIT","type":"Call","action":"Sell","strike":70.0,"premium":0.22,"openDate":"2025-01-21","expDate":"2025-01-31","contracts":1,"account":"Schwab","notes":"","fees":0.67,"status":"Closed","createdAt":1700000022000,"exitPrice":0.01,"closeDate":"2025-01-28"},{"id":"hist_139","symbol":"GME","type":"Put","action":"Sell","strike":25.5,"premium":0.38,"openDate":"2025-01-15","expDate":"2025-01-24","contracts":1,"account":"Schwab","notes":"","fees":0.67,"status":"Closed","createdAt":1700000023000,"exitPrice":0.03,"closeDate":"2025-01-23"},{"id":"hist_138","symbol":"GME","type":"Call","action":"Sell","strike":40.0,"premium":0.72,"openDate":"2024-12-31","expDate":"2025-01-10","contracts":1,"account":"Schwab","notes":"","fees":1.32,"status":"Closed","createdAt":1700000024000,"exitPrice":0.4,"closeDate":"2025-01-02"},{"id":"hist_137","symbol":"GME","type":"Call","action":"Sell","strike":40.0,"premium":1.17,"openDate":"2024-11-26","expDate":"2024-12-06","contracts":1,"account":"Schwab","notes":"","fees":1.32,"status":"Closed","createdAt":1700000025000,"exitPrice":0.45,"closeDate":"2024-11-29"},{"id":"hist_136","symbol":"IBIT","type":"Call","action":"Sell","strike":59.5,"premium":0.9,"openDate":"2024-11-21","expDate":"2024-11-29","contracts":1,"account":"Schwab","notes":"","fees":1.32,"status":"Closed","createdAt":1700000026000,"exitPrice":0.32,"closeDate":"2024-11-25"},{"id":"hist_135","symbol":"GME","type":"Put","action":"Sell","strike":35.0,"premium":1.14,"openDate":"2024-06-06","expDate":"2024-06-07","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000027000,"exitPrice":0.09,"closeDate":"2024-06-07"},{"id":"hist_134","symbol":"GME","type":"Put","action":"Sell","strike":22.5,"premium":2.55,"openDate":"2024-06-04","expDate":"2024-06-14","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000028000,"exitPrice":1.18,"closeDate":"2024-06-07"},{"id":"hist_133","symbol":"GME","type":"Put","action":"Sell","strike":25.0,"premium":1.65,"openDate":"2024-06-03","expDate":"2024-06-07","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000029000,"exitPrice":0.09,"closeDate":"2024-06-06"},{"id":"hist_132","symbol":"GME","type":"Put","action":"Sell","strike":21.5,"premium":1.74,"openDate":"2024-05-31","expDate":"2024-06-07","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000030000,"exitPrice":0.03,"closeDate":"2024-06-06"},{"id":"hist_131","symbol":"GME","type":"Put","action":"Sell","strike":20.0,"premium":2.4,"openDate":"2024-05-28","expDate":"2024-06-07","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000031000,"exitPrice":0.32,"closeDate":"2024-06-04"},{"id":"hist_130","symbol":"GME","type":"Put","action":"Sell","strike":21.0,"premium":1.85,"openDate":"2024-05-28","expDate":"2024-05-31","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000032000,"exitPrice":0.15,"closeDate":"2024-05-28"},{"id":"hist_129","symbol":"GME","type":"Put","action":"Sell","strike":21.5,"premium":1.04,"openDate":"2024-05-28","expDate":"2024-05-31","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000033000,"exitPrice":0.0,"closeDate":"2024-05-28"},{"id":"hist_128","symbol":"GME","type":"Call","action":"Buy","strike":21.5,"premium":1.09,"openDate":"2024-05-28","expDate":"2024-05-31","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.33,"status":"Closed","createdAt":1700000034000,"exitPrice":1.03,"closeDate":"2024-05-28"},{"id":"hist_127","symbol":"GME","type":"Put","action":"Sell","strike":16.0,"premium":0.73,"openDate":"2024-05-24","expDate":"2024-05-31","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000035000,"exitPrice":0.23,"closeDate":"2024-05-28"},{"id":"hist_126","symbol":"GME","type":"Put","action":"Sell","strike":18.5,"premium":1.6,"openDate":"2024-05-24","expDate":"2024-05-31","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000036000,"exitPrice":0.2,"closeDate":"2024-05-28"},{"id":"hist_125","symbol":"GME","type":"Put","action":"Sell","strike":22.5,"premium":1.56,"openDate":"2024-05-16","expDate":"2024-05-24","contracts":1,"account":"TD Ameritrade","notes":"assigned","fees":0.65,"status":"Closed","createdAt":1700000037000,"exitPrice":0.0,"closeDate":"2024-05-24"},{"id":"hist_124","symbol":"GME","type":"Put","action":"Sell","strike":18.0,"premium":0.65,"openDate":"2024-05-14","expDate":"2024-05-24","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000038000,"exitPrice":0.35,"closeDate":"2024-05-24"},{"id":"hist_123","symbol":"GME","type":"Put","action":"Sell","strike":20.0,"premium":1.01,"openDate":"2024-05-14","expDate":"2024-05-24","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000039000,"exitPrice":0.59,"closeDate":"2024-05-24"},{"id":"hist_122","symbol":"GME","type":"Call","action":"Sell","strike":23.0,"premium":2.15,"openDate":"2024-05-10","expDate":"2024-05-17","contracts":2,"account":"TD Ameritrade","notes":"","fees":2.65,"status":"Closed","createdAt":1700000040000,"exitPrice":8.1,"closeDate":"2024-05-13"},{"id":"hist_121","symbol":"GME","type":"Call","action":"Sell","strike":25.0,"premium":1.25,"openDate":"2024-05-06","expDate":"2024-05-17","contracts":3,"account":"TD Ameritrade","notes":"","fees":3.97,"status":"Closed","createdAt":1700000041000,"exitPrice":8.1,"closeDate":"2024-05-13"},{"id":"hist_120","symbol":"GME","type":"Call","action":"Sell","strike":25.0,"premium":1.53,"openDate":"2024-05-03","expDate":"2024-05-10","contracts":3,"account":"TD Ameritrade","notes":"","fees":4.65,"status":"Closed","createdAt":1700000042000,"exitPrice":0.38,"closeDate":"2024-05-06"},{"id":"hist_119","symbol":"GME","type":"Call","action":"Sell","strike":20.0,"premium":1.8,"openDate":"2024-05-03","expDate":"2024-05-10","contracts":2,"account":"TD Ameritrade","notes":"","fees":2.66,"status":"Closed","createdAt":1700000043000,"exitPrice":1.27,"closeDate":"2024-05-10"},{"id":"hist_118","symbol":"BITO","type":"Call","action":"Sell","strike":31.0,"premium":0.67,"openDate":"2024-04-09","expDate":"2024-04-12","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000044000,"exitPrice":0.02,"closeDate":"2024-04-12"},{"id":"hist_117","symbol":"BITO","type":"Call","action":"Sell","strike":32.0,"premium":0.67,"openDate":"2024-04-08","expDate":"2024-04-12","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000045000,"exitPrice":0.34,"closeDate":"2024-04-09"},{"id":"hist_116","symbol":"GME","type":"Put","action":"Sell","strike":13.5,"premium":1.25,"openDate":"2024-03-11","expDate":"2024-03-29","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000046000,"exitPrice":0.0,"closeDate":"2024-03-29"},{"id":"hist_115","symbol":"GME","type":"Put","action":"Sell","strike":14.0,"premium":1.49,"openDate":"2024-03-11","expDate":"2024-03-29","contracts":2,"account":"TD Ameritrade","notes":"","fees":1.33,"status":"Closed","createdAt":1700000047000,"exitPrice":0.0,"closeDate":"2024-03-29"},{"id":"hist_114","symbol":"GME","type":"Put","action":"Sell","strike":14.0,"premium":0.81,"openDate":"2024-03-07","expDate":"2024-03-22","contracts":2,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000048000,"exitPrice":0.8,"closeDate":"2024-03-29"},{"id":"hist_113","symbol":"GME","type":"Put","action":"Sell","strike":14.0,"premium":0.44,"openDate":"2024-03-04","expDate":"2024-03-15","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.33,"status":"Closed","createdAt":1700000049000,"exitPrice":0.17,"closeDate":"2024-03-11"},{"id":"hist_112","symbol":"GME","type":"Put","action":"Sell","strike":12.5,"premium":0.33,"openDate":"2024-02-20","expDate":"2024-03-01","contracts":2,"account":"TD Ameritrade","notes":"","fees":1.33,"status":"Closed","createdAt":1700000050000,"exitPrice":0.0,"closeDate":"2024-03-01"},{"id":"hist_111","symbol":"GME","type":"Put","action":"Sell","strike":14.0,"premium":0.43,"openDate":"2024-02-16","expDate":"2024-02-23","contracts":2,"account":"TD Ameritrade","notes":"","fees":1.33,"status":"Closed","createdAt":1700000051000,"exitPrice":0.0,"closeDate":"2024-02-23"},{"id":"hist_110","symbol":"GME","type":"Put","action":"Sell","strike":15.0,"premium":0.49,"openDate":"2024-02-12","expDate":"2024-02-16","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000052000,"exitPrice":0.0,"closeDate":"2024-02-16"},{"id":"hist_109","symbol":"GME","type":"Put","action":"Sell","strike":16.0,"premium":1.15,"openDate":"2024-02-12","expDate":"2024-02-16","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000053000,"exitPrice":0.0,"closeDate":"2024-02-16"},{"id":"hist_108","symbol":"GME","type":"Put","action":"Sell","strike":15.0,"premium":0.59,"openDate":"2024-02-12","expDate":"2024-02-16","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.33,"status":"Closed","createdAt":1700000054000,"exitPrice":0.5,"closeDate":"2024-02-12"},{"id":"hist_107","symbol":"GME","type":"Put","action":"Sell","strike":14.0,"premium":0.29,"openDate":"2024-02-09","expDate":"2024-02-16","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000055000,"exitPrice":0.0,"closeDate":"2024-02-16"},{"id":"hist_106","symbol":"GME","type":"Put","action":"Sell","strike":14.0,"premium":0.3,"openDate":"2024-02-09","expDate":"2024-02-16","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000056000,"exitPrice":0.25,"closeDate":"2024-02-09"},{"id":"hist_105","symbol":"GME","type":"Put","action":"Sell","strike":13.5,"premium":0.29,"openDate":"2024-02-05","expDate":"2024-02-16","contracts":2,"account":"TD Ameritrade","notes":"","fees":1.33,"status":"Closed","createdAt":1700000057000,"exitPrice":0.02,"closeDate":"2024-02-16"},{"id":"hist_104","symbol":"GME","type":"Put","action":"Sell","strike":12.5,"premium":0.22,"openDate":"2024-02-05","expDate":"2024-02-16","contracts":2,"account":"TD Ameritrade","notes":"","fees":2.66,"status":"Closed","createdAt":1700000058000,"exitPrice":0.14,"closeDate":"2024-02-08"},{"id":"hist_103","symbol":"GME","type":"Put","action":"Sell","strike":14.5,"premium":0.22,"openDate":"2024-01-25","expDate":"2024-01-26","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000059000,"exitPrice":0.0,"closeDate":"2024-01-26"},{"id":"hist_102","symbol":"GME","type":"Put","action":"Sell","strike":14.0,"premium":0.2,"openDate":"2024-01-22","expDate":"2024-01-26","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000060000,"exitPrice":0.0,"closeDate":"2024-01-26"},{"id":"hist_101","symbol":"GME","type":"Put","action":"Sell","strike":13.0,"premium":0.15,"openDate":"2024-01-18","expDate":"2024-01-26","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000061000,"exitPrice":0.0,"closeDate":"2024-01-26"},{"id":"hist_100","symbol":"BITO","type":"Call","action":"Sell","strike":26.0,"premium":0.21,"openDate":"2024-01-08","expDate":"2024-01-12","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000062000,"exitPrice":0.0,"closeDate":"2024-01-12"},{"id":"hist_99","symbol":"GME","type":"Call","action":"Sell","strike":24.5,"premium":0.31,"openDate":"2023-12-14","expDate":"2023-12-22","contracts":2,"account":"TD Ameritrade","notes":"","fees":1.36,"status":"Closed","createdAt":1700000063000,"exitPrice":0.02,"closeDate":"2023-12-15"},{"id":"hist_98","symbol":"GME","type":"Call","action":"Sell","strike":24.0,"premium":0.39,"openDate":"2023-12-06","expDate":"2023-12-15","contracts":2,"account":"TD Ameritrade","notes":"","fees":1.36,"status":"Closed","createdAt":1700000064000,"exitPrice":0.04,"closeDate":"2023-12-14"},{"id":"hist_97","symbol":"GME","type":"Put","action":"Sell","strike":13.5,"premium":0.73,"openDate":"2023-12-06","expDate":"2023-12-15","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.34,"status":"Closed","createdAt":1700000065000,"exitPrice":0.31,"closeDate":"2023-12-07"},{"id":"hist_96","symbol":"GME","type":"Call","action":"Sell","strike":24.0,"premium":0.35,"openDate":"2023-12-01","expDate":"2023-12-08","contracts":2,"account":"TD Ameritrade","notes":"","fees":2.64,"status":"Closed","createdAt":1700000066000,"exitPrice":0.3,"closeDate":"2023-12-04"},{"id":"hist_95","symbol":"GME","type":"Call","action":"Sell","strike":23.0,"premium":0.25,"openDate":"2023-11-29","expDate":"2023-12-01","contracts":2,"account":"TD Ameritrade","notes":"","fees":1.34,"status":"Closed","createdAt":1700000067000,"exitPrice":0.02,"closeDate":"2023-12-01"},{"id":"hist_94","symbol":"GME","type":"Put","action":"Sell","strike":13.0,"premium":0.7,"openDate":"2023-11-29","expDate":"2023-12-08","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000068000,"exitPrice":0.26,"closeDate":"2023-12-06"},{"id":"hist_93","symbol":"GME","type":"Call","action":"Buy","strike":21.0,"premium":0.21,"openDate":"2023-11-29","expDate":"2023-12-01","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000069000,"exitPrice":0.27,"closeDate":"2023-11-29"},{"id":"hist_92","symbol":"GME","type":"Put","action":"Sell","strike":16.5,"premium":0.4,"openDate":"2023-09-28","expDate":"2023-10-06","contracts":1,"account":"TD Ameritrade","notes":"ASSIGNED","fees":0.66,"status":"Closed","createdAt":1700000070000,"exitPrice":0.0,"closeDate":"2023-10-06"},{"id":"hist_91","symbol":"GME","type":"Put","action":"Sell","strike":16.5,"premium":0.43,"openDate":"2023-09-11","expDate":"2023-09-22","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000071000,"exitPrice":0.03,"closeDate":"2023-09-22"},{"id":"hist_90","symbol":"GME","type":"Call","action":"Sell","strike":24.0,"premium":0.48,"openDate":"2023-08-21","expDate":"2023-09-08","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000072000,"exitPrice":0.0,"closeDate":"2023-09-08"},{"id":"hist_89","symbol":"GME","type":"Put","action":"Sell","strike":16.0,"premium":0.56,"openDate":"2023-08-16","expDate":"2023-09-08","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000073000,"exitPrice":0.0,"closeDate":"2023-09-08"},{"id":"hist_88","symbol":"GME","type":"Put","action":"Sell","strike":19.0,"premium":0.21,"openDate":"2023-08-08","expDate":"2023-08-18","contracts":1,"account":"TD Ameritrade","notes":"ASSIGNED","fees":0.0,"status":"Closed","createdAt":1700000074000,"exitPrice":0.0,"closeDate":"2023-08-18"},{"id":"hist_87","symbol":"IBM","type":"Call","action":"Buy","strike":140.0,"premium":1.6,"openDate":"2023-07-20","expDate":"2023-08-04","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000075000,"exitPrice":2.67,"closeDate":"2023-07-27"},{"id":"hist_86","symbol":"GME","type":"Put","action":"Sell","strike":23.5,"premium":0.92,"openDate":"2023-06-06","expDate":"2023-06-09","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000076000,"exitPrice":1.11,"closeDate":"2023-06-09"},{"id":"hist_85","symbol":"GME","type":"Put","action":"Sell","strike":22.5,"premium":0.89,"openDate":"2023-06-06","expDate":"2023-06-09","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000077000,"exitPrice":0.59,"closeDate":"2023-06-07"},{"id":"hist_84","symbol":"GME","type":"Put","action":"Buy","strike":22.0,"premium":0.25,"openDate":"2023-05-26","expDate":"2023-06-02","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000078000,"exitPrice":0.0,"closeDate":"2023-06-02"},{"id":"hist_83","symbol":"GME","type":"Put","action":"Buy","strike":22.0,"premium":0.45,"openDate":"2023-05-23","expDate":"2023-06-02","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000079000,"exitPrice":0.0,"closeDate":"2023-06-02"},{"id":"hist_82","symbol":"GME","type":"Put","action":"Sell","strike":20.5,"premium":0.31,"openDate":"2023-05-08","expDate":"2023-05-12","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000080000,"exitPrice":0.15,"closeDate":"2023-05-12"},{"id":"hist_80","symbol":"GME","type":"Call","action":"Sell","strike":20.0,"premium":0.53,"openDate":"2023-04-24","expDate":"2023-04-28","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000081000,"exitPrice":0.08,"closeDate":"2023-04-28"},{"id":"hist_79","symbol":"GME","type":"Put","action":"Sell","strike":21.5,"premium":0.24,"openDate":"2023-04-10","expDate":"2023-04-14","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000082000,"exitPrice":0.0,"closeDate":"2023-04-14"},{"id":"hist_78","symbol":"SPY","type":"Put","action":"Buy","strike":406.0,"premium":0.4,"openDate":"2023-03-31","expDate":"2023-03-31","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000083000,"exitPrice":0.37,"closeDate":"2023-03-31"},{"id":"hist_77","symbol":"SPY","type":"Call","action":"Buy","strike":408.0,"premium":0.48,"openDate":"2023-03-31","expDate":"2023-03-31","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000084000,"exitPrice":0.41,"closeDate":"2023-03-31"},{"id":"hist_76","symbol":"GME","type":"Call","action":"Buy","strike":18.0,"premium":1.39,"openDate":"2023-03-21","expDate":"2023-04-07","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000085000,"exitPrice":7.6,"closeDate":"2023-03-22"},{"id":"hist_75","symbol":"GME","type":"Put","action":"Sell","strike":13.5,"premium":0.5,"openDate":"2023-03-16","expDate":"2023-03-31","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000086000,"exitPrice":0.01,"closeDate":"2023-03-27"},{"id":"hist_74","symbol":"SPY","type":"Put","action":"Buy","strike":386.0,"premium":0.61,"openDate":"2023-03-15","expDate":"2023-03-15","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000087000,"exitPrice":0.44,"closeDate":"2023-03-15"},{"id":"hist_73","symbol":"SPY","type":"Put","action":"Buy","strike":383.0,"premium":0.81,"openDate":"2023-03-15","expDate":"2023-03-15","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000088000,"exitPrice":0.99,"closeDate":"2023-03-15"},{"id":"hist_72","symbol":"SPY","type":"Put","action":"Buy","strike":384.0,"premium":1.27,"openDate":"2023-03-15","expDate":"2023-03-15","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000089000,"exitPrice":1.61,"closeDate":"2023-03-15"},{"id":"hist_70","symbol":"SPY","type":"Put","action":"Buy","strike":389.0,"premium":1.47,"openDate":"2023-03-10","expDate":"2023-03-10","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000090000,"exitPrice":1.6,"closeDate":"2023-03-10"},{"id":"hist_69","symbol":"SPY","type":"Put","action":"Buy","strike":389.0,"premium":0.85,"openDate":"2023-03-10","expDate":"2023-03-10","contracts":10,"account":"TD Ameritrade","notes":"","fees":13.23,"status":"Closed","createdAt":1700000091000,"exitPrice":0.94,"closeDate":"2023-03-10"},{"id":"hist_68","symbol":"SPY","type":"Put","action":"Buy","strike":389.0,"premium":0.82,"openDate":"2023-03-10","expDate":"2023-03-10","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000092000,"exitPrice":0.92,"closeDate":"2023-03-10"},{"id":"hist_67","symbol":"GME","type":"Put","action":"Sell","strike":16.0,"premium":0.31,"openDate":"2023-03-01","expDate":"2023-03-17","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000093000,"exitPrice":0.17,"closeDate":"2023-03-07"},{"id":"hist_66","symbol":"TSLA","type":"Call","action":"Buy","strike":215.0,"premium":2.78,"openDate":"2023-03-01","expDate":"2023-03-03","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000094000,"exitPrice":3.0,"closeDate":"2023-03-01"},{"id":"hist_65","symbol":"GME","type":"Call","action":"Sell","strike":21.5,"premium":0.64,"openDate":"2023-02-27","expDate":"2023-03-17","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000095000,"exitPrice":0.01,"closeDate":"2023-03-17"},{"id":"hist_64","symbol":"GME","type":"Put","action":"Buy","strike":21.25,"premium":0.15,"openDate":"2023-02-17","expDate":"2023-02-17","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000096000,"exitPrice":0.0,"closeDate":"2023-02-17"},{"id":"hist_63","symbol":"GME","type":"Put","action":"Buy","strike":21.5,"premium":0.28,"openDate":"2023-02-17","expDate":"2023-02-17","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000097000,"exitPrice":0.0,"closeDate":"2023-02-17"},{"id":"hist_62","symbol":"GME","type":"Call","action":"Sell","strike":23.0,"premium":0.54,"openDate":"2023-02-16","expDate":"2023-02-24","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000098000,"exitPrice":0.01,"closeDate":"2023-02-24"},{"id":"hist_61","symbol":"GME","type":"Call","action":"Sell","strike":21.5,"premium":0.6,"openDate":"2023-02-08","expDate":"2023-02-10","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000099000,"exitPrice":0.01,"closeDate":"2023-02-10"},{"id":"hist_60","symbol":"GME","type":"Put","action":"Sell","strike":17.5,"premium":0.53,"openDate":"2023-01-23","expDate":"2023-02-03","contracts":1,"account":"TD Ameritrade","notes":"Expired","fees":0.66,"status":"Closed","createdAt":1700000100000,"exitPrice":0.0,"closeDate":"2023-02-03"},{"id":"hist_59","symbol":"GME","type":"Call","action":"Buy","strike":125.0,"premium":0.58,"openDate":"2023-01-23","expDate":"2024-01-19","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000101000,"exitPrice":0.0,"closeDate":"2024-01-19"},{"id":"hist_58","symbol":"GME","type":"Call","action":"Sell","strike":18.5,"premium":0.79,"openDate":"2023-01-19","expDate":"2023-01-20","contracts":1,"account":"TD Ameritrade","notes":"ASSIGNED","fees":0.67,"status":"Closed","createdAt":1700000102000,"exitPrice":0.0,"closeDate":"2023-01-20"},{"id":"hist_57","symbol":"GME","type":"Call","action":"Sell","strike":22.5,"premium":0.65,"openDate":"2023-01-18","expDate":"2023-01-27","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000103000,"exitPrice":0.31,"closeDate":"2023-01-19"},{"id":"hist_56","symbol":"GME","type":"Call","action":"Sell","strike":24.5,"premium":0.73,"openDate":"2023-01-18","expDate":"2023-01-27","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000104000,"exitPrice":0.35,"closeDate":"2023-01-18"},{"id":"hist_55","symbol":"GME","type":"Call","action":"Sell","strike":24.0,"premium":0.51,"openDate":"2023-01-13","expDate":"2023-01-20","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000105000,"exitPrice":0.32,"closeDate":"2023-01-18"},{"id":"hist_54","symbol":"GME","type":"Call","action":"Sell","strike":23.0,"premium":0.48,"openDate":"2023-01-11","expDate":"2023-01-13","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000106000,"exitPrice":0.02,"closeDate":"2023-01-13"},{"id":"hist_53","symbol":"GME","type":"Put","action":"Sell","strike":15.5,"premium":1.0,"openDate":"2023-01-09","expDate":"2023-01-27","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000107000,"exitPrice":0.04,"closeDate":"2023-01-23"},{"id":"hist_52","symbol":"GME","type":"Put","action":"Sell","strike":17.0,"premium":1.07,"openDate":"2022-12-15","expDate":"2023-01-13","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000108000,"exitPrice":0.8,"closeDate":"2023-01-09"},{"id":"hist_51","symbol":"GME","type":"Put","action":"Sell","strike":18.0,"premium":0.72,"openDate":"2022-12-13","expDate":"2023-01-06","contracts":1,"account":"TD Ameritrade","notes":"ASSIGNED","fees":0.67,"status":"Closed","createdAt":1700000109000,"exitPrice":0.0,"closeDate":"2023-01-06"},{"id":"hist_50","symbol":"GME","type":"Put","action":"Sell","strike":20.0,"premium":0.52,"openDate":"2022-12-06","expDate":"2022-12-16","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000110000,"exitPrice":0.27,"closeDate":"2022-12-15"},{"id":"hist_49","symbol":"GME","type":"Put","action":"Sell","strike":21.0,"premium":1.0,"openDate":"2022-11-18","expDate":"2022-12-09","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000111000,"exitPrice":0.16,"closeDate":"2022-12-02"},{"id":"hist_48","symbol":"GME","type":"Put","action":"Sell","strike":20.5,"premium":0.63,"openDate":"2022-11-09","expDate":"2022-11-18","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000112000,"exitPrice":0.28,"closeDate":"2022-11-10"},{"id":"hist_47","symbol":"SPY","type":"Put","action":"Buy","strike":370.0,"premium":0.74,"openDate":"2022-11-02","expDate":"2022-11-04","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000113000,"exitPrice":3.0,"closeDate":"2022-11-03"},{"id":"hist_46","symbol":"GME","type":"Put","action":"Sell","strike":22.0,"premium":1.17,"openDate":"2022-10-24","expDate":"2022-11-11","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000114000,"exitPrice":0.52,"closeDate":"2022-10-26"},{"id":"hist_45","symbol":"GME","type":"Put","action":"Sell","strike":21.5,"premium":0.75,"openDate":"2022-10-11","expDate":"2022-10-28","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000115000,"exitPrice":0.09,"closeDate":"2022-10-24"},{"id":"hist_44","symbol":"GME","type":"Call","action":"Buy","strike":225.0,"premium":0.2,"openDate":"2022-10-03","expDate":"2023-01-20","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000116000,"exitPrice":0.0,"closeDate":"2023-01-20"},{"id":"hist_43","symbol":"GME","type":"Put","action":"Sell","strike":22.0,"premium":0.63,"openDate":"2022-10-03","expDate":"2022-10-14","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000117000,"exitPrice":0.25,"closeDate":"2022-10-04"},{"id":"hist_42","symbol":"GME","type":"Put","action":"Sell","strike":23.0,"premium":0.46,"openDate":"2022-09-22","expDate":"2022-09-30","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000118000,"exitPrice":0.07,"closeDate":"2022-09-28"},{"id":"hist_41","symbol":"GME","type":"Put","action":"Sell","strike":23.0,"premium":0.48,"openDate":"2022-09-08","expDate":"2022-09-16","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000119000,"exitPrice":0.05,"closeDate":"2022-09-14"},{"id":"hist_40","symbol":"GME","type":"Put","action":"Sell","strike":23.0,"premium":0.3,"openDate":"2022-08-26","expDate":"2022-09-09","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000120000,"exitPrice":0.08,"closeDate":"2022-09-09"},{"id":"hist_39","symbol":"GME","type":"Put","action":"Sell","strike":40.5,"premium":0.75,"openDate":"2022-08-16","expDate":"2022-08-19","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000121000,"exitPrice":0.0,"closeDate":"2022-08-19"},{"id":"hist_38","symbol":"GME","type":"Put","action":"Sell","strike":38.13,"premium":0.72,"openDate":"2022-08-16","expDate":"2022-08-19","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000122000,"exitPrice":0.27,"closeDate":"2022-08-16"},{"id":"hist_37","symbol":"GME","type":"Call","action":"Buy","strike":127.5,"premium":5.2,"openDate":"2022-08-16","expDate":"2024-01-19","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000123000,"exitPrice":0.0,"closeDate":"2024-01-19"},{"id":"hist_36","symbol":"GME","type":"Put","action":"Sell","strike":32.0,"premium":1.0,"openDate":"2022-08-15","expDate":"2022-09-02","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000124000,"exitPrice":0.82,"closeDate":"2022-08-16"},{"id":"hist_35","symbol":"GME","type":"Call","action":"Buy","strike":237.5,"premium":0.46,"openDate":"2022-08-11","expDate":"2023-01-20","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000125000,"exitPrice":0.0,"closeDate":"2023-01-20"},{"id":"hist_34","symbol":"GME","type":"Put","action":"Sell","strike":35.25,"premium":1.06,"openDate":"2022-08-08","expDate":"2022-08-26","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000126000,"exitPrice":0.82,"closeDate":"2022-08-16"},{"id":"hist_33","symbol":"GME","type":"Put","action":"Sell","strike":32.5,"premium":0.64,"openDate":"2022-08-05","expDate":"2022-08-19","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000127000,"exitPrice":0.29,"closeDate":"2022-08-08"},{"id":"hist_32","symbol":"GME","type":"Put","action":"Sell","strike":31.25,"premium":0.35,"openDate":"2022-08-03","expDate":"2022-08-12","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000128000,"exitPrice":0.15,"closeDate":"2022-08-05"},{"id":"hist_31","symbol":"GME","type":"Put","action":"Buy","strike":35.0,"premium":0.39,"openDate":"2022-07-22","expDate":"2022-07-22","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000129000,"exitPrice":0.18,"closeDate":"2022-07-29"},{"id":"hist_30","symbol":"GME","type":"Put","action":"Sell","strike":30.0,"premium":0.37,"openDate":"2022-07-22","expDate":"2022-07-29","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000130000,"exitPrice":0.02,"closeDate":"2022-07-29"},{"id":"hist_29","symbol":"DKNG","type":"Call","action":"Sell","strike":12.0,"premium":0.4,"openDate":"2022-07-11","expDate":"2022-07-15","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000131000,"exitPrice":0.0,"closeDate":"2022-07-15"},{"id":"hist_28","symbol":"DKNG","type":"Call","action":"Sell","strike":13.0,"premium":0.56,"openDate":"2022-07-08","expDate":"2022-07-15","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000132000,"exitPrice":0.15,"closeDate":"2022-07-11"},{"id":"hist_27","symbol":"DKNG","type":"Call","action":"Sell","strike":13.5,"premium":0.45,"openDate":"2022-06-21","expDate":"2022-07-08","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000133000,"exitPrice":0.02,"closeDate":"2022-07-08"},{"id":"hist_26","symbol":"WEAT","type":"Call","action":"Buy","strike":10.0,"premium":2.1,"openDate":"2022-06-14","expDate":"2023-01-20","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000134000,"exitPrice":0.0,"closeDate":"2023-01-20"},{"id":"hist_25","symbol":"NIO","type":"Put","action":"Sell","strike":16.5,"premium":0.23,"openDate":"2022-06-09","expDate":"2022-06-17","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.67,"status":"Closed","createdAt":1700000135000,"exitPrice":0.01,"closeDate":"2022-06-17"},{"id":"hist_24","symbol":"DKNG","type":"Put","action":"Sell","strike":12.5,"premium":0.22,"openDate":"2022-06-09","expDate":"2022-06-17","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000136000,"exitPrice":0.0,"closeDate":"2022-06-17"},{"id":"hist_23","symbol":"GME","type":"Put","action":"Sell","strike":50.0,"premium":0.67,"openDate":"2022-05-19","expDate":"2022-06-03","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000137000,"exitPrice":0.08,"closeDate":"2022-06-01"},{"id":"hist_22","symbol":"SPY","type":"Put","action":"Buy","strike":400.0,"premium":2.08,"openDate":"2022-05-19","expDate":"2022-05-20","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000138000,"exitPrice":2.82,"closeDate":"2022-05-19"},{"id":"hist_21","symbol":"GME","type":"Put","action":"Sell","strike":45.0,"premium":0.45,"openDate":"2022-05-16","expDate":"2022-05-27","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000139000,"exitPrice":0.18,"closeDate":"2022-05-17"},{"id":"hist_20","symbol":"GME","type":"Put","action":"Sell","strike":30.0,"premium":0.39,"openDate":"2022-05-12","expDate":"2022-05-20","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000140000,"exitPrice":0.06,"closeDate":"2022-05-16"},{"id":"hist_19","symbol":"SPY","type":"Put","action":"Buy","strike":400.0,"premium":1.69,"openDate":"2022-05-12","expDate":"2022-05-13","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000141000,"exitPrice":1.93,"closeDate":"2022-05-12"},{"id":"hist_18","symbol":"SPY","type":"Put","action":"Buy","strike":400.0,"premium":1.06,"openDate":"2022-05-09","expDate":"2022-05-09","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000142000,"exitPrice":1.49,"closeDate":"2022-05-09"},{"id":"hist_17","symbol":"SPY","type":"Put","action":"Buy","strike":406.0,"premium":1.39,"openDate":"2022-05-06","expDate":"2022-05-06","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000143000,"exitPrice":1.71,"closeDate":"2022-05-06"},{"id":"hist_16","symbol":"SPY","type":"Put","action":"Buy","strike":423.0,"premium":1.24,"openDate":"2022-04-29","expDate":"2022-04-29","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000144000,"exitPrice":1.59,"closeDate":"2022-04-29"},{"id":"hist_15","symbol":"SPY","type":"Put","action":"Buy","strike":415.0,"premium":2.28,"openDate":"2022-04-25","expDate":"2022-04-27","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000145000,"exitPrice":3.08,"closeDate":"2022-04-25"},{"id":"hist_14","symbol":"SPY","type":"Call","action":"Buy","strike":450.0,"premium":2.03,"openDate":"2022-04-21","expDate":"2022-04-25","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000146000,"exitPrice":0.78,"closeDate":"2022-04-21"},{"id":"hist_13","symbol":"TSLA","type":"Call","action":"Buy","strike":1045.0,"premium":1.91,"openDate":"2022-04-08","expDate":"2022-04-08","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000147000,"exitPrice":0.0,"closeDate":"2022-04-08"},{"id":"hist_12","symbol":"TSLA","type":"Call","action":"Buy","strike":1040.0,"premium":7.25,"openDate":"2022-04-08","expDate":"2022-04-08","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000148000,"exitPrice":0.0,"closeDate":"2022-04-08"},{"id":"hist_11","symbol":"TSLA","type":"Call","action":"Buy","strike":1045.0,"premium":7.5,"openDate":"2022-04-07","expDate":"2022-04-08","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000149000,"exitPrice":8.1,"closeDate":"2022-04-07"},{"id":"hist_10","symbol":"SPY","type":"Call","action":"Buy","strike":456.0,"premium":1.73,"openDate":"2022-04-04","expDate":"2022-04-06","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000150000,"exitPrice":2.0,"closeDate":"2022-04-04"},{"id":"hist_9","symbol":"BITO","type":"Call","action":"Buy","strike":34.0,"premium":1.59,"openDate":"2022-04-01","expDate":"2022-06-17","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000151000,"exitPrice":0.0,"closeDate":"2022-06-17"},{"id":"hist_8","symbol":"SPY","type":"Put","action":"Buy","strike":450.0,"premium":0.31,"openDate":"2022-04-01","expDate":"2022-04-01","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000152000,"exitPrice":0.49,"closeDate":"2022-04-01"},{"id":"hist_7","symbol":"SPY","type":"Put","action":"Buy","strike":457.0,"premium":0.94,"openDate":"2022-03-31","expDate":"2022-03-31","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000153000,"exitPrice":1.16,"closeDate":"2022-03-31"},{"id":"hist_6","symbol":"SPY","type":"Put","action":"Buy","strike":445.0,"premium":2.17,"openDate":"2022-03-24","expDate":"2022-03-25","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000154000,"exitPrice":2.29,"closeDate":"2022-03-24"},{"id":"hist_5","symbol":"SPY","type":"Call","action":"Buy","strike":446.0,"premium":2.68,"openDate":"2022-03-23","expDate":"2022-03-25","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000155000,"exitPrice":2.95,"closeDate":"2022-03-24"},{"id":"hist_4","symbol":"ARKX","type":"Call","action":"Buy","strike":17.95,"premium":0.25,"openDate":"2022-03-23","expDate":"2023-01-20","contracts":1,"account":"TD Ameritrade","notes":"","fees":0.66,"status":"Closed","createdAt":1700000156000,"exitPrice":0.03,"closeDate":"2023-01-20"},{"id":"hist_3","symbol":"SPY","type":"Call","action":"Buy","strike":443.0,"premium":1.18,"openDate":"2022-03-21","expDate":"2022-03-21","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000157000,"exitPrice":1.25,"closeDate":"2022-03-21"},{"id":"hist_2","symbol":"AAPL","type":"Call","action":"Buy","strike":162.5,"premium":0.69,"openDate":"2022-03-18","expDate":"2022-03-18","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000158000,"exitPrice":0.81,"closeDate":"2022-03-18"},{"id":"hist_1","symbol":"BITO","type":"Put","action":"Buy","strike":26.5,"premium":1.52,"openDate":"2022-02-18","expDate":"2022-02-25","contracts":1,"account":"TD Ameritrade","notes":"","fees":1.32,"status":"Closed","createdAt":1700000159000,"exitPrice":1.77,"closeDate":"2022-02-18"}];

async function importHistoricalIfNeeded(userId) {
  const { count } = await supabase.from("trades").select("*", { count: "exact", head: true }).eq("user_id", userId);
  if (count > 0) return []; // already has trades
  return HIST;
}

// ─── HELPERS ─────────────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const fmt = (n) => { if (n == null || isNaN(n)) return "$0.00"; const s = Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); return n < 0 ? `-$${s}` : `$${s}`; };
const pct = (n) => (n * 100).toFixed(1) + "%";
const daysBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
const today = () => new Date().toISOString().split("T")[0];

// Haptic feedback
const haptic = (ms = 10) => { try { navigator?.vibrate?.(ms); } catch {} };
const hapticLight = () => haptic(5);
const hapticMedium = () => haptic(12);
const hapticHeavy = () => haptic(25);
function calcPnL(t) { if (t.status !== "Closed" || t.exitPrice == null) return null; const m = t.action === "Sell" ? 1 : -1; return m * (t.premium - t.exitPrice) * (t.contracts || 1) * 100 - (t.fees || 0); }
function calcBE(t) { return t.action === "Sell" ? (t.type === "Put" ? t.strike - t.premium : t.strike + t.premium) : (t.type === "Call" ? t.strike + t.premium : t.strike - t.premium); }

// Capital at risk for ROC calculation
function calcCollateral(t) {
  if (t.action === "Sell") return t.strike * 100 * (t.contracts || 1); // cash secured
  return t.premium * 100 * (t.contracts || 1); // debit paid
}

// ─── DELTA-INSPIRED PALETTE ──────────────────────────────────────
const C = {
  bg: "#06080d",
  surface: "#0d1017",
  card: "#121620",
  cardGlass: "rgba(18,22,32,0.72)",
  elevated: "#181d2a",
  border: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.03)",
  green: "#22c55e",
  greenSoft: "rgba(34,197,94,0.12)",
  greenGlow: "rgba(34,197,94,0.25)",
  red: "#ef4444",
  redSoft: "rgba(239,68,68,0.12)",
  text: "#f0f2f5",
  textSec: "#9ca3b4",
  textMuted: "#4b5263",
  accent: "#6b8aed",
  accentSoft: "rgba(107,138,237,0.12)",
  gold: "#eab308",
};

const lbl = { fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: "#4b5263", fontWeight: 600, display: "block", marginBottom: 6 };

// ─── APP ─────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [trades, setTrades] = useState([]);
  const [view, setView] = useState("dash");
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  // ─── AUTH ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setLoaded(false); setTrades([]); return; }
    loadTrades(user.id).then(async (existing) => {
      if (existing.length === 0) {
        const hist = await importHistoricalIfNeeded(user.id);
        if (hist && hist.length > 0) {
          await bulkInsert(hist, user.id);
          const reloaded = await loadTrades(user.id);
          setTrades(reloaded);
        } else {
          setTrades([]);
        }
      } else {
        setTrades(existing);
      }
      setLoaded(true);
    });
  }, [user]);


  // Sync individual trade changes to Supabase
  const syncTrade = useCallback((trade) => {
    if (user) upsertTrade(trade, user.id);
  }, [user]);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const addTrade = (t) => {
    const trade = { ...t, id: uid(), createdAt: Date.now() };
    setTrades((p) => [trade, ...p]);
    if (user) upsertTrade(trade, user.id);
    flash("Trade logged"); setView("dash");
  };
  const closeTrade = (id, ep, cd, fees, closeContracts) => {
    setTrades((prev) => {
      const trade = prev.find(t => t.id === id);
      if (!trade) return prev;
      const totalC = trade.contracts || 1;
      const toClose = closeContracts || totalC;

      if (toClose >= totalC) {
        // Full close
        return prev.map((t) => t.id === id ? { ...t, status: "Closed", exitPrice: parseFloat(ep), closeDate: cd, fees: parseFloat(fees || 0) } : t);
      }
      // Partial close — split into closed portion + reduced open
      const closedPart = { ...trade, id: uid(), contracts: toClose, status: "Closed", exitPrice: parseFloat(ep), closeDate: cd, fees: parseFloat(fees || 0), createdAt: Date.now(), notes: (trade.notes ? trade.notes + " " : "") + `(partial ${toClose}/${totalC})` };
      return prev.map(t => t.id === id ? { ...t, contracts: totalC - toClose } : t).concat(closedPart);
    });
    setModal(null);
    flash(closeContracts && closeContracts < (trades.find(t => t.id === id)?.contracts || 1) ? `Closed ${closeContracts} contract${closeContracts > 1 ? "s" : ""}` : "Position closed");

  };

  const expireWorthless = (id) => {
    const trade = trades.find(t => t.id === id);
    if (!trade) return;
    const contracts = trade.contracts || 1;
    // Opening commission: $0.67 first contract + $0.70 each additional
    const fee = contracts === 1 ? 0.67 : 0.67 + (contracts - 1) * 0.70;
    setTrades((p) => p.map((t) => t.id === id ? { ...t, status: "Closed", exitPrice: 0, closeDate: t.expDate || today(), fees: Math.round(fee * 100) / 100, notes: (t.notes ? t.notes + " " : "") + "Expired worthless" } : t));
    hapticHeavy();
    flash(`Expired worthless · ${fmt(trade.premium * contracts * 100 - fee)} profit`);
  };
  const updateTrade = (id, u) => {
    setTrades((p) => {
      const updated = p.map((t) => t.id === id ? { ...t, ...u } : t);
      const trade = updated.find(t => t.id === id);
      if (user && trade) upsertTrade(trade, user.id);
      return updated;
    });
    setModal(null); flash("Trade updated");
  };
  const deleteTrade = (id) => {
    setTrades((p) => p.filter((t) => t.id !== id));
    if (user) removeTrade(id);
    setModal(null); flash("Trade removed");
  };

  // Roll = close current + open new trade form prefilled
  const [rollPrefill, setRollPrefill] = useState(null);
  const rollTrade = (id, ep, cd, fees, trade, closeContracts) => {
    closeTrade(id, ep, cd, fees, closeContracts);
    const rc = closeContracts || trade.contracts || 1;
    setRollPrefill({ symbol: trade.symbol, type: trade.type, action: trade.action, account: trade.account, strike: "", premium: "", contracts: String(rc) });
    setView("add");
  };

  const signOut = async () => { await supabase.auth.signOut(); setTrades([]); setLoaded(false); setView("dash"); };

  // Export/Import
  const exportTrades = () => {
    const blob = new Blob([JSON.stringify(trades, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `optictrade_backup_${today()}.json`; a.click();
    URL.revokeObjectURL(url); flash("Exported " + trades.length + " trades");
  };
  const importTrades = (json) => {
    try {
      const imported = JSON.parse(json);
      if (!Array.isArray(imported)) throw new Error("Invalid");
      const existingIds = new Set(trades.map(t => t.id));
      const newTrades = imported.filter(t => !existingIds.has(t.id));
      if (newTrades.length === 0) { flash("No new trades to import"); return; }
      setTrades(p => [...p, ...newTrades]);
      flash(`Imported ${newTrades.length} trades`);
    } catch { flash("Import failed — invalid file"); }
  };
  const resetAll = async () => {
    if (!confirm("Delete ALL trades? This cannot be undone.")) return;
    if (user) {
      const { error } = await supabase.from("trades").delete().eq("user_id", user.id);
      if (error) console.error("Reset error:", error);
    }
    setTrades([]);
    flash("All data cleared");
  };

  const stats = useMemo(() => {
    const closed = trades.filter((t) => t.status === "Closed");
    const open = trades.filter((t) => t.status === "Open");
    const pnls = closed.map(calcPnL).filter((x) => x != null);
    const totalPnL = pnls.reduce((a, b) => a + b, 0);
    const wins = pnls.filter((x) => x > 0).length;
    const winRate = pnls.length > 0 ? wins / pnls.length : 0;
    const sells = closed.filter((t) => t.action === "Sell");
    const sellPnls = sells.map(calcPnL).filter((x) => x != null);
    const sellWR = sellPnls.length > 0 ? sellPnls.filter((x) => x > 0).length / sellPnls.length : 0;
    const sellPnL = sellPnls.reduce((a, b) => a + b, 0);
    // Cumulative P&L timeline with collateral for ROC%
    const timelineRaw = closed.filter(t => t.closeDate).map(t => ({ date: t.closeDate, pnl: calcPnL(t) || 0, collateral: calcCollateral(t) })).sort((a, b) => a.date.localeCompare(b.date));
    let cumPnL = 0, cumColl = 0;
    const timeline = timelineRaw.map(({ date, pnl, collateral }) => { cumPnL += pnl; cumColl += collateral; return { date, pnl: cumPnL, tradePnl: pnl, cumCollateral: cumColl }; });
    const totalCollateral = closed.reduce((s, t) => s + calcCollateral(t), 0);

    const strats = {};
    closed.forEach((t) => { const l = t.action === "Sell" ? (t.type === "Call" ? "Covered Call" : "Cash Secured Put") : (t.type === "Call" ? "Long Call" : "Long Put"); if (!strats[l]) strats[l] = { pnl: 0, count: 0, wins: 0 }; const p = calcPnL(t); strats[l].pnl += p || 0; strats[l].count++; if (p > 0) strats[l].wins++; });
    return { totalPnL, winRate, wins, total: pnls.length, sellWR, sellPnL, openCount: open.length, closedCount: closed.length, timeline, totalCollateral, strats, open, closed };
  }, [trades]);

  if (authLoading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div className="su" style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.accent}, #4f6bd6)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>∆</span>
      </div>
    </div>
  );

  if (!user) return <Login />;

  if (!loaded) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div className="su" style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.accent}, #4f6bd6)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>∆</span>
      </div>
      <p className="fi" style={{ color: C.textMuted, fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 500 }}>Loading trades...</p>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: C.text, paddingBottom: 80, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: ${C.bg}; }
        input, select { font-family: 'DM Sans', sans-serif; }
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
        ::-webkit-scrollbar { width: 0; }
        ::selection { background: ${C.accent}33; }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 4px 24px rgba(107,138,237,0.25); } 50% { box-shadow: 0 4px 32px rgba(107,138,237,0.45); } }
        @keyframes stagger1 { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .su { animation: slideUp 0.32s cubic-bezier(.21,1.04,.58,1) both; }
        .fi { animation: fadeIn 0.22s ease both; }
        .stg { animation: stagger1 0.4s cubic-bezier(.21,1.04,.58,1) both; }
        .stg1 { animation-delay: 0.04s; } .stg2 { animation-delay: 0.08s; } .stg3 { animation-delay: 0.12s; }
        .stg4 { animation-delay: 0.16s; } .stg5 { animation-delay: 0.2s; } .stg6 { animation-delay: 0.24s; }
        button:active { transform: scale(0.97); }
        .fab:active { transform: translateY(-6px) scale(0.92) !important; }
        input:focus { border-color: ${C.accent}60 !important; box-shadow: 0 0 0 3px ${C.accent}15; }
      `}</style>

      {/* Header */}
      <header style={{ padding: "16px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, #4f6bd6)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>∆</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>OpticTrade</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 10px ${C.greenGlow}` }}></span>
          <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>Live</span>
        </div>
      </header>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px" }}>
        {view === "dash" && <Dashboard stats={stats} trades={trades} onClose={(t) => setModal({ type: "close", trade: t })} onEdit={(t) => setModal({ type: "edit", trade: t })} onExpire={expireWorthless} onViewLog={() => setView("log")} onStrategyTap={(name) => setModal({ type: "strategy", name })} />}
        {view === "analytics" && <Analytics trades={trades} />}
        {view === "log" && <TradeLog trades={trades} onClose={(t) => setModal({ type: "close", trade: t })} onEdit={(t) => setModal({ type: "edit", trade: t })} />}
        {view === "add" && <AddTrade onSave={addTrade} onCancel={() => { setView("dash"); setRollPrefill(null); }} prefill={rollPrefill} />}
        {view === "settings" && <Settings trades={trades} onExport={exportTrades} onImport={importTrades} onReset={resetAll} onSignOut={signOut} userEmail={user?.email} />}
      </div>

      {modal?.type === "close" && <CloseModal trade={modal.trade} onClose={closeTrade} onRoll={rollTrade} onCancel={() => setModal(null)} />}
      {modal?.type === "edit" && <EditModal trade={modal.trade} onSave={updateTrade} onDelete={deleteTrade} onCancel={() => setModal(null)} />}
      {modal?.type === "strategy" && <StrategyDetail name={modal.name} trades={trades} onCancel={() => setModal(null)} />}

      {toast && <div className="su" style={{ position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: C.elevated, border: `1px solid ${C.green}30`, borderRadius: 14, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: C.green, backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 8 }}><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>{toast}</div>}

      {/* Bottom Nav — 4 tabs + centered FAB */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: "rgba(6,8,13,0.92)", backdropFilter: "blur(24px)", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-evenly", alignItems: "center", padding: "6px 0 max(6px, env(safe-area-inset-bottom))" }}>
        <NB label="Home" active={view === "dash"} onClick={() => setView("dash")} icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 12l9-8 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 10v9a1 1 0 001 1h3v-5a1 1 0 011-1h4a1 1 0 011 1v5h3a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <NB label="Analytics" active={view === "analytics"} onClick={() => setView("analytics")} icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="10" y="7" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="2"/></svg>} />
        <button className="fab" onClick={() => { setView("add"); hapticHeavy(); }} style={{ width: 48, height: 48, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.accent}, #4f6bd6)`, color: "#fff", fontSize: 26, fontWeight: 300, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 24px rgba(107,138,237,0.3)`, transform: "translateY(-6px)", transition: "transform 0.15s, box-shadow 0.15s" }}>+</button>
        <NB label="Trades" active={view === "log"} onClick={() => setView("log")} icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>} />
        <NB label="Settings" active={view === "settings"} onClick={() => setView("settings")} icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2"/></svg>} />
      </nav>
    </div>
  );
}

function NB({ label, active, onClick, icon }) {
  return (
    <button onClick={() => { onClick(); hapticLight(); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 10px", color: active ? C.text : C.textMuted, transition: "color 0.2s, transform 0.15s", position: "relative", minWidth: 52 }}>
      <span style={{ opacity: active ? 1 : 0.45, transition: "opacity 0.2s" }}>{icon}</span>
      <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, letterSpacing: 0.2 }}>{label}</span>
      {active && <span style={{ position: "absolute", bottom: 0, width: 4, height: 4, borderRadius: "50%", background: C.accent, boxShadow: `0 0 8px ${C.accent}` }} />}
    </button>
  );
}

// ─── P&L LINE CHART (Delta-style interactive) ───────────────────
function PnLChart({ timeline, totalPnL }) {
  const [period, setPeriod] = useState("All");
  const [hover, setHover] = useState(null); // { x, idx }
  const W = 600, H = 180, PAD_X = 0, PAD_Y = 16;

  const filtered = useMemo(() => {
    if (timeline.length === 0) return [];
    if (period === "All") return timeline;

    const now = new Date();
    const cutoff = (() => {
      switch (period) {
        case "1W": return new Date(now - 7 * 86400000);
        case "1M": return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        case "YTD": return new Date(now.getFullYear(), 0, 1);
        case "1Y": return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        default: return new Date("2000-01-01");
      }
    })();
    const cutStr = cutoff.toISOString().slice(0, 10);
    const todayStr = now.toISOString().slice(0, 10);
    const pts = timeline.filter(p => p.date >= cutStr);

    // Find the P&L level at the start of this period (last trade before cutoff)
    const earlierTrades = timeline.filter(p => p.date < cutStr);
    const basePnl = earlierTrades.length > 0 ? earlierTrades[earlierTrades.length - 1].pnl : 0;
    const baseColl = earlierTrades.length > 0 ? earlierTrades[earlierTrades.length - 1].cumCollateral : 0;
    const basePoint = { date: cutStr, pnl: basePnl, tradePnl: 0, cumCollateral: baseColl };

    if (pts.length === 0) {
      // No trades in this period — flat line from baseline to today
      return [basePoint, { ...basePoint, date: todayStr }];
    }

    // Has trades in period — prepend baseline so chart starts at period boundary
    return [basePoint, ...pts];
  }, [timeline, period]);

  if (timeline.length < 2) return null;

  const minP = Math.min(0, ...filtered.map(p => p.pnl));
  const maxP = Math.max(...filtered.map(p => p.pnl));
  const range = maxP - minP || 1;

  const points = filtered.map((p, i) => ({
    x: PAD_X + (i / (filtered.length - 1)) * (W - PAD_X * 2),
    y: PAD_Y + (1 - (p.pnl - minP) / range) * (H - PAD_Y * 2),
    ...p,
  }));

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = line + ` L${points[points.length - 1].x},${H} L${points[0].x},${H} Z`;

  const lastPnl = filtered[filtered.length - 1]?.pnl || 0;
  const firstPnl = filtered[0]?.pnl || 0;
  const periodChange = lastPnl - firstPnl;
  const pos = periodChange >= 0;

  const hoverPt = hover != null ? points[hover.idx] : null;
  const displayPnl = hoverPt ? hoverPt.pnl : lastPnl;
  const displayChange = hoverPt ? hoverPt.pnl - firstPnl : periodChange;
  const displayPos = displayChange >= 0;
  const displayDate = hoverPt ? new Date(hoverPt.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : null;

  const handleMove = (clientX, rect) => {
    const relX = ((clientX - rect.left) / rect.width) * W;
    let closest = 0, closestDist = Infinity;
    points.forEach((p, i) => { const d = Math.abs(p.x - relX); if (d < closestDist) { closestDist = d; closest = i; } });
    if (!hover || hover.idx !== closest) hapticLight();
    setHover({ x: points[closest].x, idx: closest });
  };

  const onMouse = (e) => { const rect = e.currentTarget.getBoundingClientRect(); handleMove(e.clientX, rect); };
  const onTouch = (e) => { if (e.touches.length > 0) { const rect = e.currentTarget.getBoundingClientRect(); handleMove(e.touches[0].clientX, rect); } };

  const lineColor = displayPos ? "#22c55e" : "#ef4444";
  const gradId = "pnlGrad";

  return (
    <div style={{ background: C.card, borderRadius: 16, padding: "20px 0 16px", marginBottom: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      {/* Hero number integrated with chart */}
      <div style={{ padding: "0 20px", marginBottom: 4 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>
          {displayDate || "Cumulative P&L"}
        </p>
        <h2 style={{ fontFamily: "'JetBrains Mono'", fontSize: 32, fontWeight: 700, color: C.text, letterSpacing: -1.5, lineHeight: 1 }}>
          {fmt(displayPnl)}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          {displayChange !== 0 ? (
            <span style={{ fontSize: 13, fontWeight: 600, color: displayPos ? C.green : C.red, fontFamily: "'JetBrains Mono'" }}>
              {displayPos ? "+" : ""}{fmt(displayChange)}
            </span>
          ) : (
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, fontFamily: "'JetBrains Mono'" }}>
              $0.00
            </span>
          )}
          <span style={{ fontSize: 12, fontWeight: 500, color: C.textMuted }}>
            {periodChange === 0 && period !== "All" ? "no trades" : period === "All" ? "all time" : period === "YTD" ? "this year" : period === "1Y" ? "past year" : period === "1M" ? "past month" : "past week"}
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div
        style={{ position: "relative", cursor: "crosshair", touchAction: "none", margin: "12px 0 0" }}
        onMouseMove={onMouse}
        onMouseLeave={() => setHover(null)}
        onTouchMove={onTouch}
        onTouchStart={onTouch}
        onTouchEnd={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 160, display: "block" }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Zero line if visible */}
          {minP < 0 && maxP > 0 && (() => {
            const zeroY = PAD_Y + (1 - (0 - minP) / range) * (H - PAD_Y * 2);
            return <line x1={PAD_X} y1={zeroY} x2={W - PAD_X} y2={zeroY} stroke="rgba(255,255,255,0.06)" strokeDasharray="4,4" />;
          })()}
          {/* Area fill */}
          <path d={area} fill={`url(#${gradId})`} />
          {/* Line */}
          <path d={line} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Hover vertical line + dot */}
          {hoverPt && (
            <>
              <line x1={hoverPt.x} y1={0} x2={hoverPt.x} y2={H} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx={hoverPt.x} cy={hoverPt.y} r="5" fill={C.bg} stroke={lineColor} strokeWidth="2.5" />
            </>
          )}
        </svg>

        {/* Hover tooltip for trade P&L */}
        {hoverPt && hoverPt.tradePnl !== 0 && (
          <div style={{
            position: "absolute", top: 4,
            left: Math.min(Math.max(hoverPt.x / W * 100, 15), 85) + "%",
            transform: "translateX(-50%)",
            background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "4px 10px", fontSize: 10, fontFamily: "'JetBrains Mono'", fontWeight: 600,
            color: hoverPt.tradePnl >= 0 ? C.green : C.red, whiteSpace: "nowrap",
            pointerEvents: "none",
          }}>
            Trade: {fmt(hoverPt.tradePnl)}
          </div>
        )}
      </div>

      {/* Time Range Pills */}
      <div style={{ display: "flex", justifyContent: "center", gap: 4, padding: "8px 16px 0" }}>
        {["1W", "1M", "YTD", "1Y", "All"].map((p) => (
          <button key={p} onClick={() => { setPeriod(p); setHover(null); hapticMedium(); }} style={{
            padding: "6px 16px", borderRadius: 20, border: "none",
            background: period === p ? C.text : "transparent",
            color: period === p ? C.bg : C.textMuted,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            transition: "all 0.15s",
          }}>{p}</button>
        ))}
      </div>
    </div>
  );
}

// ─── STRATEGY CARDS ──────────────────────────────────────────────
function Strategies({ data, onTap }) {
  const entries = Object.entries(data).sort((a, b) => b[1].pnl - a[1].pnl);
  if (entries.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Strategies</p>
      {entries.map(([name, s]) => {
        const wr = s.count > 0 ? (s.wins / s.count * 100).toFixed(0) : 0;
        const pos = s.pnl >= 0;
        return (
          <div key={name} onClick={() => { onTap && onTap(name); hapticMedium(); }} style={{ background: C.card, borderRadius: 14, padding: "14px 16px", marginBottom: 8, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "border-color 0.15s" }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{name}</p>
              <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.count} trades · {wr}% win</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, fontWeight: 700, color: pos ? C.green : C.red }}>{fmt(s.pnl)}</span>
              <span style={{ fontSize: 14, color: C.textMuted }}>›</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────
function Dashboard({ stats, trades, onClose, onEdit, onExpire, onViewLog, onStrategyTap }) {
  const capitalLocked = stats.open.reduce((s, t) => s + calcCollateral(t), 0);
  return (
    <div className="fi">
      {/* 3 key stats */}
      <div className="stg stg1" style={{ display: "flex", gap: 10, padding: "20px 0 16px" }}>
        <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "16px 12px", textAlign: "center", border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 10, color: C.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Win Rate</p>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 20, fontWeight: 700, color: stats.winRate >= 0.5 ? C.green : C.red, lineHeight: 1 }}>{stats.total > 0 ? pct(stats.winRate) : "—"}</p>
          <p style={{ fontSize: 10, color: C.textMuted, marginTop: 6 }}>{stats.wins}W / {stats.total - stats.wins}L</p>
        </div>
        <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "16px 12px", textAlign: "center", border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 10, color: C.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Sell WR</p>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 20, fontWeight: 700, color: C.green, lineHeight: 1 }}>{stats.closedCount > 0 ? pct(stats.sellWR) : "—"}</p>
          <p style={{ fontSize: 10, color: C.textMuted, marginTop: 6 }}>Premium edge</p>
        </div>
        <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "16px 12px", textAlign: "center", border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 10, color: C.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Open</p>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 20, fontWeight: 700, color: stats.openCount > 0 ? C.accent : C.textMuted, lineHeight: 1 }}>{stats.openCount}</p>
          <p style={{ fontSize: 10, color: C.textMuted, marginTop: 6 }}>{stats.openCount > 0 ? "active" : "no positions"}</p>
        </div>
      </div>

      <div className="stg stg2"><PnLChart timeline={stats.timeline} totalPnL={stats.totalPnL} /></div>
      <div className="stg stg3"><ThisMonth trades={trades} /></div>

      {stats.open.length > 0 && (
        <div className="stg stg4" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Open Positions</p>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, background: C.accentSoft, padding: "2px 8px", borderRadius: 10 }}>{stats.open.length}</span>
            </div>
            {capitalLocked > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>Capital locked</span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, fontWeight: 700, color: C.textSec }}>{fmt(capitalLocked)}</span>
              </div>
            )}
          </div>
          {stats.open.map((t) => <OpenCard key={t.id} trade={t} onClose={() => onClose(t)} onEdit={() => onEdit(t)} onExpire={() => onExpire(t.id)} />)}
        </div>
      )}

      <div className="stg stg5"><Strategies data={stats.strats} onTap={onStrategyTap} /></div>

      {stats.closed.length > 0 && (
        <div className="stg stg6" style={{ marginBottom: 16 }}>
          <SectionHead title="Recent" action="View all" onAction={onViewLog} />
          <div style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}` }}>
            {stats.closed.slice(0, 5).map((t, i) => <Row key={t.id} trade={t} onEdit={() => onEdit(t)} last={i === Math.min(4, stats.closed.length - 1)} />)}
          </div>
        </div>
      )}

      {trades.length === 0 && (
        <div className="stg stg2" style={{ textAlign: "center", padding: "64px 24px", marginTop: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${C.card}, ${C.elevated})`, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>📊</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: -0.3 }}>Start Tracking</h3>
          <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, maxWidth: 260, margin: "0 auto" }}>Tap the + button below to log your first options trade</p>
        </div>
      )}
    </div>
  );
}

function SectionHead({ title, badge, action, onAction }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 600 }}>{title}</p>
        {badge && <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, background: C.accentSoft, padding: "2px 8px", borderRadius: 10 }}>{badge}</span>}
      </div>
      {action && <button onClick={onAction} style={{ background: "none", border: "none", color: C.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{action}</button>}
    </div>
  );
}

// ─── THIS MONTH SUMMARY ──────────────────────────────────────────
function ThisMonth({ trades }) {
  const data = useMemo(() => {
    const now = new Date();
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const closed = trades.filter(t => t.status === "Closed" && t.closeDate);

    // This month's trades
    const thisMonth = closed.filter(t => t.closeDate.startsWith(thisMonthStr));
    const tmPnl = thisMonth.reduce((s, t) => s + (calcPnL(t) || 0), 0);
    const tmCount = thisMonth.length;
    const tmWins = thisMonth.filter(t => (calcPnL(t) || 0) > 0).length;

    // Monthly average (all history)
    const months = {};
    closed.forEach(t => { const m = t.closeDate.slice(0, 7); months[m] = (months[m] || 0) + (calcPnL(t) || 0); });
    const monthValues = Object.values(months);
    const avgMonthly = monthValues.length > 0 ? monthValues.reduce((a, b) => a + b, 0) / monthValues.length : 0;

    // Last month
    const lastM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastM.getFullYear()}-${String(lastM.getMonth() + 1).padStart(2, "0")}`;
    const lastPnl = months[lastMonthStr] || 0;

    const monthName = now.toLocaleString("en", { month: "long" });

    return { tmPnl, tmCount, tmWins, avgMonthly, lastPnl, monthName };
  }, [trades]);

  return (
    <div style={{ background: C.card, borderRadius: 16, padding: "16px 18px", marginBottom: 16, border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>{data.monthName}</p>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 24, fontWeight: 700, color: data.tmPnl >= 0 ? (data.tmPnl > 0 ? C.green : C.text) : C.red, marginTop: 4, lineHeight: 1 }}>
            {data.tmCount > 0 ? fmt(data.tmPnl) : "$0.00"}
          </p>
        </div>
        {data.tmCount > 0 && (
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{data.tmCount} trades</p>
            <p style={{ fontSize: 11, color: C.textMuted }}>{data.tmWins}W / {data.tmCount - data.tmWins}L</p>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, background: C.elevated, borderRadius: 10, padding: "8px 12px" }}>
          <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>Monthly Avg</p>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 700, color: data.avgMonthly >= 0 ? C.green : C.red }}>{fmt(data.avgMonthly)}</p>
        </div>
        <div style={{ flex: 1, background: C.elevated, borderRadius: 10, padding: "8px 12px" }}>
          <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>Last Month</p>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 700, color: data.lastPnl >= 0 ? (data.lastPnl > 0 ? C.green : C.textSec) : C.red }}>{data.lastPnl !== 0 ? fmt(data.lastPnl) : "—"}</p>
        </div>
        <div style={{ flex: 1, background: C.elevated, borderRadius: 10, padding: "8px 12px" }}>
          <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>vs Avg</p>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 700, color: data.tmPnl >= data.avgMonthly ? C.green : C.red }}>
            {data.avgMonthly !== 0 ? (data.tmPnl >= data.avgMonthly ? "↑" : "↓") + " " + Math.abs(((data.tmPnl - data.avgMonthly) / Math.abs(data.avgMonthly)) * 100).toFixed(0) + "%" : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── OPEN POSITION CARD (smart) ──────────────────────────────────
function OpenCard({ trade: t, onClose, onEdit, onExpire }) {
  const be = calcBE(t);
  const strat = t.action === "Sell" ? (t.type === "Call" ? "CC" : "CSP") : (t.type === "Call" ? "LC" : "LP");
  const stratColor = t.action === "Sell" ? C.green : C.accent;
  const daysHeld = daysBetween(t.openDate, today());

  // DTE calculation
  const dte = t.expDate ? daysBetween(today(), t.expDate) : null;
  const isExpired = dte !== null && dte <= 0;
  const isUrgent = dte !== null && dte <= 3 && dte > 0;
  const dteColor = isExpired ? C.red : isUrgent ? C.gold : dte <= 7 ? "#f97316" : C.textSec;

  // Time progress (how much of the trade's life has passed)
  const totalLife = t.expDate && t.openDate ? daysBetween(t.openDate, t.expDate) : 0;
  const elapsed = totalLife > 0 ? Math.min(1, daysHeld / totalLife) : 0;

  // Collateral and max gain for sells
  const collateral = calcCollateral(t);
  const maxGain = t.action === "Sell" ? t.premium * (t.contracts || 1) * 100 : null;

  return (
    <div style={{ background: C.card, borderRadius: 14, padding: 16, marginBottom: 10, border: `1px solid ${isExpired ? C.red + "30" : C.border}` }}>
      {/* Top row: symbol, strategy, DTE */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.elevated, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: C.accent, flexShrink: 0 }}>{t.symbol}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>${t.strike} {t.type}</span>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "2px 7px", borderRadius: 6, background: stratColor + "18", color: stratColor, letterSpacing: 0.5 }}>{strat}</span>
            </div>
            <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
              {t.contracts > 1 ? `${t.contracts}x · ` : ""}${t.premium} prem · {daysHeld}d held
            </p>
          </div>
        </div>
        {/* DTE badge */}
        {dte !== null && (
          <div style={{ textAlign: "center", flexShrink: 0, minWidth: 50 }}>
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 20, fontWeight: 700, color: dteColor, lineHeight: 1 }}>
              {isExpired ? "EXP" : dte}
            </p>
            <p style={{ fontSize: 9, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>
              {isExpired ? "expired" : dte === 1 ? "day" : "days"}
            </p>
          </div>
        )}
      </div>

      {/* Time decay progress bar */}
      {totalLife > 0 && !isExpired && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 500 }}>Time Decay</span>
            <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 500 }}>{(elapsed * 100).toFixed(0)}% elapsed</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: C.elevated, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              width: `${elapsed * 100}%`,
              background: elapsed > 0.8
                ? `linear-gradient(90deg, ${C.green}, ${C.gold})`
                : elapsed > 0.5
                  ? `linear-gradient(90deg, ${C.green}90, ${C.green})`
                  : C.green + "60",
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>
      )}

      {/* Key metrics row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, background: C.elevated, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
          <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>Break-Even</p>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 700, color: C.gold }}>${be.toFixed(2)}</p>
        </div>
        {maxGain != null && (
          <div style={{ flex: 1, background: C.elevated, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>Max Gain</p>
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 700, color: C.green }}>{fmt(maxGain)}</p>
          </div>
        )}
        <div style={{ flex: 1, background: C.elevated, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
          <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>Collateral</p>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 700, color: C.textSec }}>{fmt(collateral)}</p>
        </div>
      </div>

      {/* Action buttons — different layout if expired */}
      {isExpired && t.action === "Sell" ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onEdit} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Edit</button>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Close Manual</button>
          <button onClick={() => { onExpire(); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.green}, #16a34a)`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Expired Worthless</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onEdit} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Edit</button>
          <button onClick={onClose} style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: C.greenSoft, color: C.green, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Close Position</button>
        </div>
      )}
    </div>
  );
}

// ─── TRADE ROW (Delta asset-row style) ───────────────────────────
function Row({ trade: t, onClose, onEdit, last }) {
  const pnl = calcPnL(t);
  const be = calcBE(t);
  const isOpen = t.status === "Open";
  const strat = t.action === "Sell" ? (t.type === "Call" ? "CC" : "CSP") : (t.type === "Call" ? "LC" : "LP");
  const stratColor = t.action === "Sell" ? C.green : C.accent;
  const days = isOpen ? daysBetween(t.openDate, today()) + "d" : t.closeDate ? daysBetween(t.openDate, t.closeDate) + "d" : "";

  return (
    <div onClick={onEdit} style={{ padding: "14px 16px", borderBottom: last ? "none" : `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, cursor: onEdit ? "pointer" : "default", transition: "background 0.15s" }}
      onMouseEnter={(e) => onEdit && (e.currentTarget.style.background = C.elevated + "60")}
      onMouseLeave={(e) => onEdit && (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: C.elevated, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: C.accent, flexShrink: 0, letterSpacing: -0.3 }}>{t.symbol}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>${t.strike} {t.type}</span>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: stratColor, background: stratColor === C.green ? C.greenSoft : C.accentSoft, padding: "2px 6px", borderRadius: 6, letterSpacing: 0.5 }}>{strat}</span>
        </div>
        <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
          ${t.premium} prem · BE ${be.toFixed(2)} · {days}
          {t.expDate && ` · ${t.expDate.slice(5)}`}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {isOpen && onClose && <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenSoft, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>Close</button>}
        {!isOpen && <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 700, color: pnl >= 0 ? C.green : C.red }}>{fmt(pnl)}</span>}
      </div>
    </div>
  );
}

// ─── TRADE LOG ───────────────────────────────────────────────────
function TradeLog({ trades, onClose, onEdit }) {
  const [filter, setFilter] = useState("All");
  const [sym, setSym] = useState("");
  const symbols = [...new Set(trades.map((t) => t.symbol))].sort();
  const filtered = trades.filter((t) => {
    if (filter === "Open" && t.status !== "Open") return false;
    if (filter === "Closed" && t.status !== "Closed") return false;
    if (filter === "Wins") { const p = calcPnL(t); return p != null && p > 0; }
    if (filter === "Losses") { const p = calcPnL(t); return p != null && p < 0; }
    if (sym && t.symbol !== sym) return false;
    return true;
  }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const totalPnL = filtered.filter(t => t.status === "Closed").map(calcPnL).filter(x => x != null).reduce((a, b) => a + b, 0);

  return (
    <div className="fi" style={{ paddingTop: 20 }}>
      <div className="stg stg1" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Trades</h2>
        <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{filtered.length} trades · <span style={{ color: totalPnL >= 0 ? C.green : C.red, fontFamily: "'JetBrains Mono'", fontWeight: 600 }}>{fmt(totalPnL)}</span></p>
      </div>
      <div className="stg stg2" style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["All", "Open", "Closed", "Wins", "Losses"].map((f) => <button key={f} onClick={() => { setFilter(f); hapticLight(); }} style={{ padding: "7px 16px", borderRadius: 20, border: "none", background: filter === f ? C.text : C.card, color: filter === f ? C.bg : C.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>{f}</button>)}
        {symbols.length > 1 && <select value={sym} onChange={(e) => setSym(e.target.value)} style={{ padding: "7px 14px", borderRadius: 20, border: "none", background: C.card, color: C.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}><option value="">All</option>{symbols.map((s) => <option key={s}>{s}</option>)}</select>}
      </div>
      <div className="stg stg3" style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}` }}>
        {filtered.length === 0 && <p style={{ padding: 32, textAlign: "center", color: C.textMuted, fontSize: 13 }}>No trades found</p>}
        {filtered.map((t, i) => <Row key={t.id} trade={t} onClose={t.status === "Open" ? () => onClose(t) : undefined} onEdit={() => onEdit(t)} last={i === filtered.length - 1} />)}
      </div>
    </div>
  );
}

// ─── ADD TRADE ───────────────────────────────────────────────────
function AddTrade({ onSave, onCancel, prefill }) {
  const [f, sF] = useState({
    symbol: prefill?.symbol || "GME", type: prefill?.type || "Call", action: prefill?.action || "Sell",
    strike: prefill?.strike || "", premium: prefill?.premium || "", expDate: "", openDate: today(),
    contracts: prefill?.contracts || "1", account: prefill?.account || "Schwab", notes: prefill ? "Rolled" : "",
  });
  const set = (k, v) => sF((p) => ({ ...p, [k]: v }));
  const ok = f.symbol && f.strike && f.premium && f.openDate;
  const doSave = () => onSave({ symbol: f.symbol.toUpperCase().trim(), type: f.type, action: f.action, strike: parseFloat(f.strike), premium: parseFloat(f.premium), expDate: f.expDate, openDate: f.openDate, contracts: parseInt(f.contracts) || 1, account: f.account, notes: f.notes, status: "Open", exitPrice: null, closeDate: null, fees: 0 });
  const be = f.strike && f.premium ? calcBE({ strike: parseFloat(f.strike), premium: parseFloat(f.premium), type: f.type, action: f.action }) : null;

  return (
    <div className="su" style={{ paddingTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{prefill ? "Roll Trade" : "New Trade"}</h2>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 14, cursor: "pointer", fontWeight: 500 }}>Cancel</button>
      </div>
      <div style={{ background: C.card, borderRadius: 20, padding: 20, border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <Toggle label="Type" opts={["Call", "Put"]} val={f.type} set={(v) => set("type", v)} />
          <Toggle label="Action" opts={["Sell", "Buy"]} val={f.action} set={(v) => set("action", v)} colors={{ Sell: C.green, Buy: C.accent }} />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}><Inp label="Ticker" value={f.symbol} onChange={(v) => set("symbol", v)} /><Inp label="Strike" value={f.strike} onChange={(v) => set("strike", v)} type="number" placeholder="28.00" /></div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}><Inp label="Premium" value={f.premium} onChange={(v) => set("premium", v)} type="number" placeholder="0.33" /><Inp label="Contracts" value={f.contracts} onChange={(v) => set("contracts", v)} type="number" /></div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}><Inp label="Open Date" value={f.openDate} onChange={(v) => set("openDate", v)} type="date" /><Inp label="Exp Date" value={f.expDate} onChange={(v) => set("expDate", v)} type="date" /></div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Account</label>
          <div style={{ display: "flex", gap: 6 }}>{["Schwab", "Computershare", "Other"].map((a) => <button key={a} onClick={() => { set("account", a); hapticLight(); }} style={{ padding: "8px 14px", borderRadius: 12, border: "none", background: f.account === a ? C.text : C.elevated, color: f.account === a ? C.bg : C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>{a}</button>)}</div>
        </div>
        <Inp label="Notes" value={f.notes} onChange={(v) => set("notes", v)} placeholder="Optional" mb={20} />
        {be != null && <div style={{ background: C.elevated, borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: C.textMuted }}>Break-Even</span><span style={{ fontFamily: "'JetBrains Mono'", fontSize: 16, fontWeight: 700, color: C.gold }}>${be.toFixed(2)}</span></div>}
        <button onClick={doSave} disabled={!ok} style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: ok ? `linear-gradient(135deg, ${C.accent}, #4f6bd6)` : C.elevated, color: ok ? "#fff" : C.textMuted, fontSize: 15, fontWeight: 700, cursor: ok ? "pointer" : "default", boxShadow: ok ? "0 4px 20px rgba(107,138,237,0.25)" : "none" }}>Log Trade</button>
      </div>
    </div>
  );
}

// ─── MODALS ──────────────────────────────────────────────────────
function ModalShell({ children, onCancel }) {
  return (
    <div className="fi" style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(12px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onCancel}>
      <div className="su" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: "20px 20px 0 0", padding: "12px 24px 24px", width: "100%", maxWidth: 480, border: `1px solid ${C.border}`, borderBottom: "none", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.textMuted + "40", margin: "0 auto 16px" }} />
        {children}
      </div>
    </div>
  );
}

function CloseModal({ trade: t, onClose, onRoll, onCancel }) {
  const [ep, setEp] = useState("");
  const [cd, setCd] = useState(today());
  const [fees, setFees] = useState("0");
  const totalC = t.contracts || 1;
  const [closeC, setCloseC] = useState(String(totalC));
  const cc = parseInt(closeC) || totalC;
  const isPartial = cc < totalC;

  const pv = ep !== "" ? (() => { const m = t.action === "Sell" ? 1 : -1; return m * (t.premium - parseFloat(ep)) * cc * 100 - (parseFloat(fees) || 0); })() : null;
  const collateral = t.strike * 100 * cc;
  const roc = pv != null && collateral > 0 ? (pv / collateral * 100).toFixed(2) : null;

  return (
    <ModalShell onCancel={onCancel}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Close Position</h3>
      <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>{t.symbol} ${t.strike} {t.type} · {t.action === "Sell" ? "Sold" : "Bought"} @ ${t.premium} · {totalC} contract{totalC > 1 ? "s" : ""}</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <Inp label={t.action === "Sell" ? "Buyback $" : "Sell $"} value={ep} onChange={setEp} type="number" placeholder="0.00" autoFocus />
        <Inp label="Fees" value={fees} onChange={setFees} type="number" placeholder="0" />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <Inp label="Close Date" value={cd} onChange={setCd} type="date" />
        {totalC > 1 && (
          <div style={{ flex: 1 }}>
            <label style={lbl}>Contracts</label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => { setCloseC(String(Math.max(1, cc - 1))); hapticLight(); }} style={{ width: 36, height: 40, borderRadius: 10, border: "none", background: C.elevated, color: C.text, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 700, flex: 1, textAlign: "center" }}>{cc}<span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>/{totalC}</span></span>
              <button onClick={() => { setCloseC(String(Math.min(totalC, cc + 1))); hapticLight(); }} style={{ width: 36, height: 40, borderRadius: 10, border: "none", background: C.elevated, color: C.text, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>
        )}
      </div>

      {isPartial && (
        <div style={{ background: C.accentSoft, borderRadius: 10, padding: "8px 14px", marginBottom: 14, fontSize: 12, color: C.accent, fontWeight: 500 }}>
          Partial close — {cc} of {totalC} contracts. Remaining {totalC - cc} will stay open.
        </div>
      )}

      {pv != null && (
        <div style={{ background: pv >= 0 ? C.greenSoft : C.redSoft, borderRadius: 14, padding: "16px", marginBottom: 20, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>P&L{isPartial ? ` (${cc} contracts)` : ""}</p>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 28, fontWeight: 700, color: pv >= 0 ? C.green : C.red }}>{fmt(pv)}</p>
          {roc != null && <p style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{roc}% ROC on {fmt(collateral)} collateral</p>}
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ padding: "14px 14px", borderRadius: 14, border: "none", background: C.elevated, color: C.textSec, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
        <button onClick={() => { onRoll(t.id, ep || "0", cd, fees, t, cc); hapticHeavy(); }} style={{ flex: 1, padding: "14px", borderRadius: 14, border: `1px solid ${C.accent}40`, background: C.accentSoft, color: C.accent, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Roll</button>
        <button onClick={() => { onClose(t.id, ep || "0", cd, fees, cc); hapticHeavy(); }} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.green}, #16a34a)`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{isPartial ? `Close ${cc}` : "Close"}</button>
      </div>
    </ModalShell>
  );
}

function EditModal({ trade: t, onSave, onDelete, onCancel }) {
  const [f, sF] = useState({
    symbol: t.symbol || "", type: t.type || "Call", action: t.action || "Sell",
    strike: String(t.strike ?? ""), premium: String(t.premium ?? ""),
    expDate: t.expDate || "", openDate: t.openDate || "",
    closeDate: t.closeDate || "", exitPrice: t.exitPrice != null ? String(t.exitPrice) : "",
    contracts: String(t.contracts ?? "1"), account: t.account || "Schwab",
    notes: t.notes || "", fees: String(t.fees ?? "0"), status: t.status || "Open",
  });
  const set = (k, v) => sF((p) => ({ ...p, [k]: v }));
  const ok = f.symbol && f.strike && f.premium && f.openDate;

  const doSave = () => {
    const u = { symbol: f.symbol.toUpperCase().trim(), type: f.type, action: f.action, strike: parseFloat(f.strike), premium: parseFloat(f.premium), expDate: f.expDate, openDate: f.openDate, contracts: parseInt(f.contracts) || 1, account: f.account, notes: f.notes, status: f.status };
    if (f.status === "Closed") { u.closeDate = f.closeDate || today(); u.exitPrice = parseFloat(f.exitPrice) || 0; u.fees = parseFloat(f.fees) || 0; }
    else { u.closeDate = null; u.exitPrice = null; u.fees = 0; }
    onSave(t.id, u);
  };

  const pv = f.status === "Closed" && f.exitPrice !== "" ? (() => { const m = f.action === "Sell" ? 1 : -1; return m * (parseFloat(f.premium) - parseFloat(f.exitPrice)) * (parseInt(f.contracts) || 1) * 100 - (parseFloat(f.fees) || 0); })() : null;
  const be = f.strike && f.premium ? calcBE({ strike: parseFloat(f.strike), premium: parseFloat(f.premium), type: f.type, action: f.action }) : null;

  return (
    <ModalShell onCancel={onCancel}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Edit Trade</h3>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
      </div>

      <div style={{ marginBottom: 18 }}><Toggle label="Status" opts={["Open", "Closed"]} val={f.status} set={(v) => set("status", v)} colors={{ Open: C.accent, Closed: C.green }} /></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <Toggle label="Type" opts={["Call", "Put"]} val={f.type} set={(v) => set("type", v)} />
        <Toggle label="Action" opts={["Sell", "Buy"]} val={f.action} set={(v) => set("action", v)} colors={{ Sell: C.green, Buy: C.accent }} />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}><Inp label="Ticker" value={f.symbol} onChange={(v) => set("symbol", v)} /><Inp label="Strike" value={f.strike} onChange={(v) => set("strike", v)} type="number" /></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}><Inp label="Premium" value={f.premium} onChange={(v) => set("premium", v)} type="number" /><Inp label="Contracts" value={f.contracts} onChange={(v) => set("contracts", v)} type="number" /></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}><Inp label="Open Date" value={f.openDate} onChange={(v) => set("openDate", v)} type="date" /><Inp label="Exp Date" value={f.expDate} onChange={(v) => set("expDate", v)} type="date" /></div>

      {f.status === "Closed" && (
        <div style={{ background: C.elevated, borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: C.gold, fontWeight: 700, marginBottom: 10 }}>Close Details</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}><Inp label="Exit Price" value={f.exitPrice} onChange={(v) => set("exitPrice", v)} type="number" placeholder="0.00" /><Inp label="Fees" value={f.fees} onChange={(v) => set("fees", v)} type="number" /></div>
          <Inp label="Close Date" value={f.closeDate} onChange={(v) => set("closeDate", v)} type="date" />
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Account</label>
        <div style={{ display: "flex", gap: 6 }}>{["Schwab", "Computershare", "Other"].map((a) => <button key={a} onClick={() => { set("account", a); hapticLight(); }} style={{ padding: "8px 14px", borderRadius: 12, border: "none", background: f.account === a ? C.text : C.elevated, color: f.account === a ? C.bg : C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>{a}</button>)}</div>
      </div>
      <Inp label="Notes" value={f.notes} onChange={(v) => set("notes", v)} placeholder="Optional" mb={16} />

      {(be != null || pv != null) && (
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {be != null && <div style={{ flex: 1, background: C.elevated, borderRadius: 12, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: C.textMuted }}>BE</span><span style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 700, color: C.gold }}>${be.toFixed(2)}</span></div>}
          {pv != null && <div style={{ flex: 1, background: pv >= 0 ? C.greenSoft : C.redSoft, borderRadius: 12, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: C.textMuted }}>P&L</span><span style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 700, color: pv >= 0 ? C.green : C.red }}>{fmt(pv)}</span></div>}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => { if (confirm("Delete this trade?")) onDelete(t.id); }} style={{ padding: "14px 18px", borderRadius: 14, border: "none", background: C.redSoft, color: C.red, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete</button>
        <button onClick={doSave} disabled={!ok} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", background: ok ? `linear-gradient(135deg, ${C.accent}, #4f6bd6)` : C.elevated, color: ok ? "#fff" : C.textMuted, fontSize: 15, fontWeight: 700, cursor: ok ? "pointer" : "default", boxShadow: ok ? "0 4px 20px rgba(107,138,237,0.25)" : "none" }}>Save Changes</button>
      </div>
    </ModalShell>
  );
}

// ─── STRATEGY DETAIL MODAL ───────────────────────────────────────
function StrategyDetail({ name, trades, onCancel }) {
  const data = useMemo(() => {
    // Map strategy name to action/type filter
    const filters = {
      "Covered Call": { action: "Sell", type: "Call" },
      "Cash Secured Put": { action: "Sell", type: "Put" },
      "Long Call": { action: "Buy", type: "Call" },
      "Long Put": { action: "Buy", type: "Put" },
    };
    const f = filters[name];
    if (!f) return null;

    const all = trades.filter(t => t.action === f.action && t.type?.replace(/\s/g, "") === f.type);
    const closed = all.filter(t => t.status === "Closed");
    const pnls = closed.map(t => ({ trade: t, pnl: calcPnL(t) || 0 }));
    const totalPnL = pnls.reduce((s, p) => s + p.pnl, 0);
    const wins = pnls.filter(p => p.pnl > 0).length;
    const winRate = pnls.length > 0 ? wins / pnls.length : 0;

    // Averages
    const avgPremium = closed.length > 0 ? closed.reduce((s, t) => s + t.premium, 0) / closed.length : 0;
    const daysArr = closed.filter(t => t.openDate && t.closeDate).map(t => daysBetween(t.openDate, t.closeDate));
    const avgDays = daysArr.length > 0 ? daysArr.reduce((a, b) => a + b, 0) / daysArr.length : 0;

    // Avg ROC per trade
    const rocs = closed.map(t => {
      const pnl = calcPnL(t) || 0;
      const coll = calcCollateral(t);
      return coll > 0 ? (pnl / coll) * 100 : 0;
    });
    const avgROC = rocs.length > 0 ? rocs.reduce((a, b) => a + b, 0) / rocs.length : 0;

    // Best & worst
    const sorted = [...pnls].sort((a, b) => b.pnl - a.pnl);
    const best = sorted[0] || null;
    const worst = sorted[sorted.length - 1] || null;

    // Monthly P&L
    const months = {};
    closed.forEach(t => {
      if (!t.closeDate) return;
      const m = t.closeDate.slice(0, 7);
      if (!months[m]) months[m] = 0;
      months[m] += calcPnL(t) || 0;
    });
    const monthly = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);

    // Recent (newest first by createdAt)
    const recent = [...closed].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 10);

    // Tickers
    const tickers = {};
    closed.forEach(t => { tickers[t.symbol] = (tickers[t.symbol] || 0) + 1; });
    const topTickers = Object.entries(tickers).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { all, closed, totalPnL, wins, winRate, avgPremium, avgDays, avgROC, best, worst, monthly, recent, topTickers, openCount: all.filter(t => t.status === "Open").length };
  }, [name, trades]);

  if (!data) return null;

  const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtMo = (m) => { const [, mo] = m.split("-"); return MONTHS_SHORT[parseInt(mo) - 1]; };
  const maxBar = data.monthly.length > 0 ? Math.max(...data.monthly.map(([, v]) => Math.abs(v)), 1) : 1;
  const pos = data.totalPnL >= 0;
  const stratColor = name.startsWith("Covered") || name.startsWith("Cash") ? C.green : C.accent;

  const tradeSummary = (t) => {
    if (!t) return "";
    const pnl = calcPnL(t.trade) || 0;
    return `${t.trade.symbol} $${t.trade.strike} · ${fmt(pnl)}`;
  };

  return (
    <div className="fi" style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(12px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onCancel}>
      <div className="su" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 480, border: `1px solid ${C.border}`, borderBottom: "none", maxHeight: "90vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: stratColor }}></div>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>{name}</h3>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>{data.closed.length} closed</span>
              {data.openCount > 0 && <span style={{ fontSize: 11, color: C.accent }}>{data.openCount} open</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 22, fontWeight: 700, color: pos ? C.green : C.red }}>{fmt(data.totalPnL)}</p>
            <p style={{ fontSize: 11, color: pos ? C.green : C.red }}>{pct(data.winRate)} win rate</p>
          </div>
        </div>

        {/* Avg stats row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1, background: C.elevated, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Avg Premium</p>
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, fontWeight: 700 }}>${data.avgPremium.toFixed(2)}</p>
          </div>
          <div style={{ flex: 1, background: C.elevated, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Avg Days</p>
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, fontWeight: 700 }}>{data.avgDays.toFixed(1)}</p>
          </div>
          <div style={{ flex: 1, background: C.elevated, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Avg ROC</p>
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, fontWeight: 700, color: data.avgROC >= 0 ? C.green : C.red }}>{data.avgROC.toFixed(2)}%</p>
          </div>
        </div>

        {/* Best & Worst */}
        {data.best && data.worst && data.closed.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <div style={{ flex: 1, background: C.greenSoft, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.green}15` }}>
              <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Best Trade</p>
              <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 700, color: C.green }}>{fmt(data.best.pnl)}</p>
              <p style={{ fontSize: 10, color: C.textSec, marginTop: 3 }}>{data.best.trade.symbol} ${data.best.trade.strike} {data.best.trade.closeDate ? data.best.trade.closeDate.slice(5) : ""}</p>
            </div>
            <div style={{ flex: 1, background: C.redSoft, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.red}15` }}>
              <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Worst Trade</p>
              <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 700, color: C.red }}>{fmt(data.worst.pnl)}</p>
              <p style={{ fontSize: 10, color: C.textSec, marginTop: 3 }}>{data.worst.trade.symbol} ${data.worst.trade.strike} {data.worst.trade.closeDate ? data.worst.trade.closeDate.slice(5) : ""}</p>
            </div>
          </div>
        )}

        {/* Top tickers */}
        {data.topTickers.length > 1 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Tickers</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {data.topTickers.map(([sym, cnt]) => (
                <span key={sym} style={{ fontSize: 11, fontWeight: 600, color: C.textSec, background: C.elevated, padding: "4px 10px", borderRadius: 8 }}>{sym} ({cnt})</span>
              ))}
            </div>
          </div>
        )}

        {/* Monthly mini-chart */}
        {data.monthly.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Monthly P&L</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
              {data.monthly.map(([m, v]) => {
                const h = Math.max(3, (Math.abs(v) / maxBar) * 60);
                const neg = v < 0;
                return (
                  <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ width: "100%", height: h, borderRadius: 3, background: neg ? `linear-gradient(180deg, ${C.red}55, ${C.red}18)` : `linear-gradient(180deg, ${stratColor}50, ${stratColor}15)` }} />
                    <span style={{ fontSize: 8, color: C.textMuted }}>{fmtMo(m)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent trades */}
        {data.recent.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Recent Trades</p>
            <div style={{ background: C.elevated, borderRadius: 12, overflow: "hidden" }}>
              {data.recent.map((t, i) => {
                const pnl = calcPnL(t);
                const be = calcBE(t);
                const days = t.closeDate && t.openDate ? daysBetween(t.openDate, t.closeDate) + "d" : "";
                return (
                  <div key={t.id} style={{ padding: "10px 14px", borderBottom: i < data.recent.length - 1 ? `1px solid ${C.border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{t.symbol} ${t.strike}</span>
                      <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 8 }}>${t.premium} prem · {days}</span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 700, color: pnl >= 0 ? C.green : C.red }}>{fmt(pnl)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Close button */}
        <button onClick={onCancel} style={{ width: "100%", marginTop: 20, padding: "14px", borderRadius: 14, border: "none", background: C.elevated, color: C.textSec, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Close</button>
      </div>
    </div>
  );
}

// ─── TICKER BREAKDOWN ────────────────────────────────────────────
// ─── TICKER BREAKDOWN ────────────────────────────────────────────
function TickerBreakdown({ trades }) {
  const [expanded, setExpanded] = useState(null);

  const data = useMemo(() => {
    const closed = trades.filter(t => t.status === "Closed");
    const tickers = {};

    trades.forEach(t => {
      const sym = t.symbol;
      if (!tickers[sym]) tickers[sym] = { trades: [], closed: [], pnl: 0, wins: 0, sells: 0, buys: 0, sellPnl: 0, buyPnl: 0 };
      tickers[sym].trades.push(t);
      if (t.status === "Closed") {
        const pnl = calcPnL(t) || 0;
        tickers[sym].closed.push(t);
        tickers[sym].pnl += pnl;
        if (pnl > 0) tickers[sym].wins++;
        if (t.action === "Sell") { tickers[sym].sells++; tickers[sym].sellPnl += pnl; }
        else { tickers[sym].buys++; tickers[sym].buyPnl += pnl; }
      }
    });

    return Object.entries(tickers)
      .map(([sym, d]) => ({
        symbol: sym,
        totalTrades: d.trades.length,
        closedCount: d.closed.length,
        openCount: d.trades.filter(t => t.status === "Open").length,
        pnl: d.pnl,
        winRate: d.closed.length > 0 ? d.wins / d.closed.length : 0,
        wins: d.wins,
        losses: d.closed.length - d.wins,
        sells: d.sells, buys: d.buys,
        sellPnl: d.sellPnl, buyPnl: d.buyPnl,
        avgPremium: d.closed.length > 0 ? d.closed.reduce((s, t) => s + t.premium, 0) / d.closed.length : 0,
        recent: [...d.closed].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 8),
      }))
      .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
  }, [trades]);

  if (data.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Ticker Breakdown</h3>

      {data.map(d => {
        const isExp = expanded === d.symbol;
        const pos = d.pnl >= 0;
        return (
          <div key={d.symbol} style={{ marginBottom: 10 }}>
            {/* Ticker row */}
            <div
              onClick={() => { setExpanded(isExp ? null : d.symbol); hapticMedium(); }}
              style={{ background: C.card, borderRadius: 14, padding: "14px 18px", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: C.elevated, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: C.accent }}>{d.symbol}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{d.symbol}</p>
                  <p style={{ fontSize: 11, color: C.textMuted }}>{d.closedCount} trades · {d.wins}W/{d.losses}L · {(d.winRate * 100).toFixed(0)}%{d.openCount > 0 ? ` · ${d.openCount} open` : ""}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, fontWeight: 700, color: pos ? C.green : C.red }}>{fmt(d.pnl)}</span>
                <span style={{ fontSize: 14, color: C.textMuted, transform: isExp ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
              </div>
            </div>

            {/* Expanded detail */}
            {isExp && (
              <div style={{ marginTop: 6, paddingLeft: 8 }}>
                {/* Sell vs Buy split */}
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1, background: C.elevated, borderRadius: 12, padding: "12px 14px", borderLeft: `3px solid ${C.green}` }}>
                    <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Selling ({d.sells})</p>
                    <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, fontWeight: 700, color: d.sellPnl >= 0 ? C.green : C.red }}>{fmt(d.sellPnl)}</p>
                  </div>
                  <div style={{ flex: 1, background: C.elevated, borderRadius: 12, padding: "12px 14px", borderLeft: `3px solid ${C.accent}` }}>
                    <p style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Buying ({d.buys})</p>
                    <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, fontWeight: 700, color: d.buyPnl >= 0 ? C.green : C.red }}>{fmt(d.buyPnl)}</p>
                  </div>
                </div>

                {/* Avg premium */}
                <div style={{ background: C.elevated, borderRadius: 12, padding: "10px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>Avg Premium</span>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 700 }}>${d.avgPremium.toFixed(2)}</span>
                </div>

                {/* Recent trades */}
                {d.recent.length > 0 && (
                  <div style={{ background: C.elevated, borderRadius: 12, overflow: "hidden" }}>
                    <p style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, padding: "10px 14px 6px" }}>Recent</p>
                    {d.recent.map((t, i) => {
                      const pnl = calcPnL(t);
                      const strat = t.action === "Sell" ? (t.type?.replace(/\s/g, "") === "Call" ? "CC" : "CSP") : (t.type?.replace(/\s/g, "") === "Call" ? "LC" : "LP");
                      const sc = t.action === "Sell" ? C.green : C.accent;
                      return (
                        <div key={t.id} style={{ padding: "8px 14px", borderBottom: i < d.recent.length - 1 ? `1px solid ${C.border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "1px 6px", borderRadius: 4, background: sc + "18", color: sc }}>{strat}</span>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>${t.strike}</span>
                            <span style={{ fontSize: 10, color: C.textMuted }}>${t.premium}{t.closeDate ? " · " + t.closeDate.slice(5) : ""}</span>
                          </div>
                          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, fontWeight: 700, color: pnl >= 0 ? C.green : C.red }}>{fmt(pnl)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ANALYTICS ───────────────────────────────────────────────────
function Analytics({ trades }) {
  const data = useMemo(() => {
    const closed = trades.filter(t => t.status === "Closed" && t.closeDate);

    // Build monthly P&L keyed by YYYY-MM
    const monthly = {};
    closed.forEach(t => {
      const m = t.closeDate.slice(0, 7);
      const pnl = calcPnL(t) || 0;
      if (!monthly[m]) monthly[m] = { pnl: 0, count: 0, wins: 0 };
      monthly[m].pnl += pnl;
      monthly[m].count++;
      if (pnl > 0) monthly[m].wins++;
    });

    // Group by year
    const years = {};
    Object.entries(monthly).forEach(([m, d]) => {
      const y = m.slice(0, 4);
      if (!years[y]) years[y] = { months: {}, pnl: 0, count: 0, wins: 0 };
      years[y].months[m] = d;
      years[y].pnl += d.pnl;
      years[y].count += d.count;
      years[y].wins += d.wins;
    });

    // Find best/worst months globally
    const allMonths = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));
    const best = allMonths.reduce((a, b) => b[1].pnl > a[1].pnl ? b : a, ["", { pnl: -Infinity }]);
    const worst = allMonths.reduce((a, b) => b[1].pnl < a[1].pnl ? b : a, ["", { pnl: Infinity }]);

    return { years, allMonths, best, worst };
  }, [trades]);

  const sortedYears = Object.entries(data.years).sort((a, b) => b[0].localeCompare(a[0])); // newest first
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const fmtMonth = (m) => {
    const [, mo] = m.split("-");
    return MONTHS[parseInt(mo) - 1];
  };

  return (
    <div className="fi" style={{ paddingTop: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 20 }}>Analytics</h2>

      {/* Year-over-year summary */}
      <div className="stg stg1" style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {sortedYears.map(([year, d]) => {
          const pos = d.pnl >= 0;
          return (
            <div key={year} style={{ flex: "0 0 auto", background: C.card, borderRadius: 14, padding: "14px 18px", border: `1px solid ${C.border}`, minWidth: 100, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, marginBottom: 6 }}>{year}</p>
              <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 16, fontWeight: 700, color: pos ? C.green : C.red, lineHeight: 1 }}>{fmt(d.pnl)}</p>
              <p style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>{d.count} trades</p>
            </div>
          );
        })}
      </div>

      {/* Best / Worst callouts */}
      {data.allMonths.length > 1 && (
        <div className="stg stg2" style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, background: C.greenSoft, borderRadius: 14, padding: "12px 16px", border: `1px solid ${C.green}15` }}>
            <p style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Best Month</p>
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 16, fontWeight: 700, color: C.green }}>{fmt(data.best[1].pnl)}</p>
            <p style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{data.best[0] ? fmtMonth(data.best[0]) + " " + data.best[0].slice(0, 4) : ""}</p>
          </div>
          <div style={{ flex: 1, background: C.redSoft, borderRadius: 14, padding: "12px 16px", border: `1px solid ${C.red}15` }}>
            <p style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Worst Month</p>
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 16, fontWeight: 700, color: C.red }}>{fmt(data.worst[1].pnl)}</p>
            <p style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{data.worst[0] ? fmtMonth(data.worst[0]) + " " + data.worst[0].slice(0, 4) : ""}</p>
          </div>
        </div>
      )}

      {/* Yearly sections with monthly bars */}
      {sortedYears.map(([year, yd]) => {
        const monthEntries = Object.entries(yd.months).sort((a, b) => a[0].localeCompare(b[0]));
        const maxAbs = Math.max(...monthEntries.map(([, d]) => Math.abs(d.pnl)), 1);
        const wr = yd.count > 0 ? (yd.wins / yd.count * 100).toFixed(0) : 0;

        return (
          <div key={year} style={{ background: C.card, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${C.border}` }}>
            {/* Year header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{year}</h3>
                <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{yd.count} trades · {wr}% win rate</p>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 700, color: yd.pnl >= 0 ? C.green : C.red }}>
                {fmt(yd.pnl)}
              </span>
            </div>

            {/* Monthly bars */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 130 }}>
              {monthEntries.map(([m, d]) => {
                const h = Math.max(4, (Math.abs(d.pnl) / maxAbs) * 100);
                const neg = d.pnl < 0;
                return (
                  <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono'", fontWeight: 600, color: neg ? C.red : C.green, whiteSpace: "nowrap" }}>
                      {d.pnl >= 0 ? "+" : ""}{d.pnl >= 1000 || d.pnl <= -1000 ? (d.pnl / 1000).toFixed(1) + "k" : Math.round(d.pnl)}
                    </span>
                    <div style={{
                      width: "100%", height: h, borderRadius: 4,
                      background: neg
                        ? `linear-gradient(180deg, ${C.red}55, ${C.red}18)`
                        : `linear-gradient(180deg, ${C.green}50, ${C.green}15)`,
                    }} />
                    <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 500 }}>{fmtMonth(m)}</span>
                  </div>
                );
              })}
            </div>

            {/* Monthly detail rows */}
            <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              {monthEntries.map(([m, d]) => {
                const mWr = d.count > 0 ? (d.wins / d.count * 100).toFixed(0) : 0;
                return (
                  <div key={m} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 32 }}>{fmtMonth(m)}</span>
                      <span style={{ fontSize: 10, color: C.textMuted }}>{d.count} trades · {mWr}% win</span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 700, color: d.pnl >= 0 ? C.green : C.red }}>{fmt(d.pnl)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ─── WHEEL CYCLES ─────────────────────────────────────── */}
      <div className="stg stg3"><TickerBreakdown trades={trades} /></div>

      {sortedYears.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: C.textMuted }}>
          <p style={{ fontSize: 14 }}>No closed trades yet. Analytics will appear as you build history.</p>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────
function Settings({ trades, onExport, onImport, onReset, onSignOut, userEmail }) {
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => onImport(ev.target.result);
      reader.readAsText(file);
    };
    input.click();
  };

  const open = trades.filter(t => t.status === "Open").length;
  const closed = trades.filter(t => t.status === "Closed").length;
  const symbols = [...new Set(trades.map(t => t.symbol))].length;
  const oldest = trades.filter(t => t.openDate).sort((a, b) => a.openDate.localeCompare(b.openDate))[0];
  const span = oldest ? `Since ${new Date(oldest.openDate).toLocaleDateString("en", { month: "short", year: "numeric" })}` : "No trades";

  return (
    <div className="fi" style={{ paddingTop: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 20 }}>Settings</h2>

      {/* Data Summary */}
      <div className="stg stg1" style={{ background: C.card, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Your Data</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><p style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Total Trades</p><p style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 700 }}>{trades.length}</p></div>
          <div><p style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Tickers</p><p style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 700 }}>{symbols}</p></div>
          <div><p style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Open / Closed</p><p style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 700 }}>{open} / {closed}</p></div>
          <div><p style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>History</p><p style={{ fontSize: 14, fontWeight: 600, color: C.textSec }}>{span}</p></div>
        </div>
      </div>

      {/* Export/Import */}
      <div className="stg stg2" style={{ background: C.card, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Backup & Transfer</p>
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 16, lineHeight: 1.5 }}>Export your trades as JSON to back up or transfer to another device. Import merges new trades without duplicating.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onExport} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.accent}, #4f6bd6)`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Export JSON
          </button>
          <button onClick={handleImport} style={{ flex: 1, padding: "14px", borderRadius: 14, border: `1px solid ${C.accent}40`, background: C.accentSoft, color: C.accent, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Import JSON
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="stg stg3" style={{ background: C.card, borderRadius: 16, padding: 20, marginBottom: 24, border: `1px solid ${C.red}15` }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: C.red }}>Danger Zone</p>
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 16, lineHeight: 1.5 }}>This permanently deletes all trades from this device. Export first if you want to keep your data.</p>
        <button onClick={onReset} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: C.redSoft, color: C.red, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Reset All Data
        </button>
      </div>

      {/* Account */}
      <div className="stg stg4" style={{ background: C.card, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Account</p>
        {userEmail && <p style={{ fontSize: 12, color: C.textSec, marginBottom: 16 }}>{userEmail}</p>}
        <button onClick={onSignOut} style={{ width: "100%", padding: "14px", borderRadius: 14, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Sign Out</button>
      </div>

      {/* About */}
      <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>OpticTrade v1.0</p>
        <p style={{ fontSize: 11, color: C.textMuted + "80", marginTop: 4 }}>Cloud synced · Options tracking terminal</p>
      </div>
    </div>
  );
}


// ─── LOGIN ───────────────────────────────────────────────────────
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError(null); setLoading(true);
    if (isSignUp) {
      const { error: e } = await supabase.auth.signUp({ email, password });
      if (e) setError(e.message);
      else setSent(true);
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password });
      if (e) setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: C.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: ${C.bg}; }
        input { font-family: 'DM Sans', sans-serif; }
        input:focus { border-color: ${C.accent}60 !important; box-shadow: 0 0 0 3px ${C.accent}15; outline: none; }
        button:active { transform: scale(0.97); }
      `}</style>

      <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${C.accent}, #4f6bd6)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>∆</span>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>OpticTrade</h1>
      <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 32 }}>Options tracking terminal</p>

      {sent ? (
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Check your email</p>
          <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>We sent a confirmation link to {email}. Click it to activate your account, then come back and sign in.</p>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ background: C.card, borderRadius: 20, padding: 24, border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>{isSignUp ? "Create Account" : "Sign In"}</p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.elevated, color: C.text, fontSize: 14, outline: "none" }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.elevated, color: C.text, fontSize: 14, outline: "none" }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            </div>

            {error && <p style={{ fontSize: 12, color: C.red, marginBottom: 14, textAlign: "center" }}>{error}</p>}

            <button onClick={handleSubmit} disabled={loading || !email || !password} style={{
              width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
              background: email && password ? `linear-gradient(135deg, ${C.accent}, #4f6bd6)` : C.elevated,
              color: email && password ? "#fff" : C.textMuted,
              fontSize: 15, fontWeight: 700, cursor: email && password ? "pointer" : "default",
              boxShadow: email && password ? "0 4px 20px rgba(107,138,237,0.25)" : "none",
            }}>{loading ? "..." : isSignUp ? "Create Account" : "Sign In"}</button>
          </div>

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.textMuted }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} style={{ background: "none", border: "none", color: C.accent, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── FORM PRIMITIVES ─────────────────────────────────────────────

function Inp({ label: l, value, onChange, type = "text", placeholder, style, autoFocus, mb = 0 }) {
  return (
    <div style={{ flex: 1, marginBottom: mb, ...style }}>
      <label style={lbl}>{l}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.elevated, color: C.text, fontSize: 14, fontFamily: type === "number" ? "'JetBrains Mono'" : "'DM Sans'", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s" }} />
    </div>
  );
}

function Toggle({ label: l, opts, val, set, colors }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={lbl}>{l}</label>
      <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", background: C.elevated, padding: 2, gap: 2 }}>
        {opts.map((o) => { const a = val === o; const c = colors?.[o] || C.accent; return (
          <button key={o} onClick={() => { set(o); hapticLight(); }} style={{ flex: 1, padding: "9px 0", border: "none", cursor: "pointer", borderRadius: 10, background: a ? (c + "22") : "transparent", color: a ? c : C.textMuted, fontSize: 13, fontWeight: a ? 700 : 500, transition: "all 0.2s" }}>{o}</button>
        ); })}
      </div>
    </div>
  );
}
