import { BASIC_QUESTIONS } from "./questions/basics.js";
import { DATA_STRUCTURE_QUESTIONS } from "./questions/data_structures.js";
import { PERSISTENCE_QUESTIONS } from "./questions/persistence.js";
import { TTL_EVICTION_QUESTIONS } from "./questions/ttl_eviction.js";
import { TRANSACTION_LUA_QUESTIONS } from "./questions/transactions_lua.js";
import { CLUSTER_REPL_QUESTIONS } from "./questions/clustering_replication.js";
import { SYSTEM_DESIGN_QUESTIONS } from "./questions/system_design.js";

export const BASE_QUESTIONS = [
  ...BASIC_QUESTIONS,
  ...DATA_STRUCTURE_QUESTIONS,
  ...PERSISTENCE_QUESTIONS,
  ...TTL_EVICTION_QUESTIONS,
  ...TRANSACTION_LUA_QUESTIONS,
  ...CLUSTER_REPL_QUESTIONS,
  ...SYSTEM_DESIGN_QUESTIONS,
];
