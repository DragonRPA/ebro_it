import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';

export const DRAGONRPA_HUB_SUPABASE = {
  url: 'https://lkohpffieaanwhohttbu.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrb2hwZmZpZWFhbndob2h0dGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5ODkxOTQsImV4cCI6MjEwODU2NTE5NH0.lOXz6JWfLNcfH4ApH74F7qtlPky8lVwGiAqY_ybSZ6E',
  projectRef: 'lkohpffieaanwhohttbu',
};

const RETIRED_PROJECT_REFS = [
  'nyfashwbdcepncpdwpdb', // ebro-platform-core -> dragonrpa-erp (core_*)
  'idfecoovqkjopgbezcpo', // ebro-awp-demo      -> dragonrpa-erp (awp_*)
  'uvmhqwpkmzxrrlkeguul', // ebro-it-demo       -> dragonrpa-erp (it_*)
  'mluhhrbcogvsalkchrdp', // ebro_fl            -> dragonrpa-erp (fl_*)
];

const KNOWN_PREFIXES = ['awp_', 'fl_', 'it_', 'core_', 'erp_', 'space_', 'pcwiki_'];

/**
 * 논리 테이블명을 프로젝트 프리픽스가 적용된 물리 테이블명으로 변환 (멱등성 보장)
 */
export function resolvePrefixedTableName(table: string, prefix: string): string {
  if (!table || typeof table !== 'string') return table;
  const clean = table.trim().replace(/^"+|"+$/g, '');
  if (!prefix) return clean;
  if (clean.startsWith(prefix)) return clean;
  for (const kp of KNOWN_PREFIXES) {
    if (clean.startsWith(kp)) return clean;
  }
  return `${prefix}${clean}`;
}

/**
 * DDL SQL 문장 내의 비프리픽스 테이블 식별자를 프로젝트 프리픽스 테이블명으로 안전 변환
 */
export function rewriteDdlStatementsWithPrefix(statements: string[], prefix: string): string[] {
  if (!Array.isArray(statements) || !prefix) return statements;
  const systemWords = new Set([
    'public',
    'anon',
    'authenticated',
    'service_role',
    'true',
    'false',
    'null',
    'select',
    'insert',
    'update',
    'delete',
    'all',
    'exists',
    'not',
    'table',
    'if',
    'only',
    'cascade',
    'restrict',
    'information_schema',
    'columns',
    'tables',
  ]);

  const prefixToken = (rawIdent: string): string => {
    const wasQuoted = rawIdent.startsWith('"') && rawIdent.endsWith('"');
    const clean = rawIdent.replace(/^"+|"+$/g, '');
    if (!clean || systemWords.has(clean.toLowerCase())) return rawIdent;
    const resolved = resolvePrefixedTableName(clean, prefix);
    return wasQuoted ? `"${resolved}"` : `"${resolved}"`;
  };

  return statements.map(stmt => {
    if (typeof stmt !== 'string') return stmt;
    let s = stmt;

    // 1. ALTER TABLE [IF EXISTS] [public.]"tbl"
    s = s.replace(
      /\b(ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:public\.)?)("?[a-zA-Z_][a-zA-Z0-9_]*"?)/gi,
      (_, pre, tbl) => `${pre}${prefixToken(tbl)}`
    );

    // 2. CREATE TABLE [IF NOT EXISTS] [public.]"tbl"
    s = s.replace(
      /\b(CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?)("?[a-zA-Z_][a-zA-Z0-9_]*"?)/gi,
      (_, pre, tbl) => `${pre}${prefixToken(tbl)}`
    );

    // 3. DROP POLICY ... ON [public.]"tbl" / CREATE POLICY ... ON [public.]"tbl"
    s = s.replace(
      /\b(POLICY\s+(?:IF\s+EXISTS\s+)?"[^"]+"\s+ON\s+(?:public\.)?)("?[a-zA-Z_][a-zA-Z0-9_]*"?)/gi,
      (_, pre, tbl) => `${pre}${prefixToken(tbl)}`
    );

    // 4. CREATE [UNIQUE] INDEX [IF NOT EXISTS] idx_name ON [public.]"tbl"
    s = s.replace(
      /\b(INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?[a-zA-Z0-9_"]+\s+ON\s+(?:public\.)?)("?[a-zA-Z_][a-zA-Z0-9_]*"?)/gi,
      (_, pre, tbl) => `${pre}${prefixToken(tbl)}`
    );

    // 5. GRANT ... ON [TABLE] [public.]"tbl"
    s = s.replace(
      /\b(GRANT\s+ALL\s+ON\s+(?:TABLE\s+)?(?:public\.)?)("?[a-zA-Z_][a-zA-Z0-9_]*"?)/gi,
      (_, pre, tbl) => `${pre}${prefixToken(tbl)}`
    );

    // 6. UPDATE [public.]"tbl" SET
    s = s.replace(
      /\b(UPDATE\s+(?:public\.)?)("?[a-zA-Z_][a-zA-Z0-9_]*"?)(\s+SET\b)/gi,
      (_, pre, tbl, post) => `${pre}${prefixToken(tbl)}${post}`
    );

    // 7. TRUNCATE TABLE "t1", "t2" CASCADE
    if (/^\s*TRUNCATE\s+TABLE\b/i.test(s)) {
      s = s.replace(
        /^(\s*TRUNCATE\s+TABLE\s+)(.+?)(\s+CASCADE\s*;?\s*|\s*;\s*)$/i,
        (_, pre, listStr, post) => {
          const rewrittenList = listStr
            .split(',')
            .map((item: string) => prefixToken(item.trim()))
            .join(', ');
          return `${pre}${rewrittenList}${post}`;
        }
      );
    }

    return s;
  });
}

/**
 * 통합된 구 프로젝트 URL이 환경변수에 남아 있더라도 자동으로 dragonrpa-erp 허브로 리다이렉트
 */
export function resolveHubUrlAndKey(url: string, anonKey: string): { url: string; anonKey: string } {
  if (!url) return { url, anonKey };
  for (const ref of RETIRED_PROJECT_REFS) {
    if (url.includes(ref)) {
      return {
        url: DRAGONRPA_HUB_SUPABASE.url,
        anonKey: DRAGONRPA_HUB_SUPABASE.anonKey,
      };
    }
  }
  return { url, anonKey };
}

/**
 * 테이블 프리픽스(.from, .channel.on, .rpc)를 게이트웨이 단에서 100% 자동 주입하는 SupabaseClient 생성기
 */
export function createPrefixedSupabaseClient(
  rawUrl: string,
  rawAnonKey: string,
  prefix: string,
  options?: SupabaseClientOptions<'public'>
): SupabaseClient {
  const { url, anonKey } = resolveHubUrlAndKey(rawUrl, rawAnonKey);
  const client = createClient(url, anonKey, options);

  // 1. .from(table) 인터셉트
  const origFrom = client.from.bind(client);
  (client as any).from = (relation: string) => {
    const resolved = resolvePrefixedTableName(relation, prefix);
    return origFrom(resolved);
  };

  // 2. .channel(name, opts).on('postgres_changes', { table }, cb) 인터셉트
  const origChannel = client.channel.bind(client);
  (client as any).channel = (name: string, opts?: any) => {
    const ch = origChannel(name, opts);
    const origOn = ch.on.bind(ch);
    (ch as any).on = (type: string, filter: any, callback: any) => {
      if (type === 'postgres_changes' && filter && typeof filter.table === 'string') {
        const nextFilter = {
          ...filter,
          table: resolvePrefixedTableName(filter.table, prefix),
        };
        return origOn(type as any, nextFilter, callback);
      }
      return origOn(type as any, filter, callback);
    };
    return ch;
  };

  // 3. .rpc(fn, args, opts) 인터셉트 (dev_get_columns 및 dev_exec_ddl 내부 테이블명 자동 프리픽스)
  const origRpc = client.rpc.bind(client);
  (client as any).rpc = (fn: string, args?: any, rpcOpts?: any) => {
    if (fn === 'dev_get_columns' && args && typeof args.p_table === 'string') {
      const nextArgs = {
        ...args,
        p_table: resolvePrefixedTableName(args.p_table, prefix),
      };
      return origRpc(fn, nextArgs, rpcOpts);
    }
    if (fn === 'dev_exec_ddl' && args && Array.isArray(args.statements)) {
      const nextArgs = {
        ...args,
        statements: rewriteDdlStatementsWithPrefix(args.statements, prefix),
      };
      return origRpc(fn, nextArgs, rpcOpts);
    }
    return origRpc(fn, args, rpcOpts);
  };

  return client;
}
