// An offline stand-in for the platform's `sdk/db`: the schema DSL, the `sql` tag and the raw
// query methods, over `node:sqlite`. Only the surface the bot uses is implemented; the fluent
// query builder is not.

import { DatabaseSync } from 'node:sqlite';

const TABLE = Symbol.for('tgcloud.table');

class SqlFragment {
  constructor(chunks) {
    this.chunks = chunks;
  }

  render() {
    let text = '';
    const params = [];
    for (const chunk of this.chunks) {
      if (chunk.kind === 'text') {
        text += chunk.value;
      } else if (chunk.kind === 'column') {
        text += quote(chunk.value.name);
      } else if (chunk.kind === 'param') {
        text += '?';
        params.push(bindable(chunk.value));
      } else {
        const nested = chunk.value.render();
        text += nested.text;
        params.push(...nested.params);
      }
    }
    return { text, params };
  }

  renderLiteral() {
    const { text, params } = this.render();
    if (params.length > 0) {
      throw new Error('parameters are not allowed in DDL contexts');
    }
    return text;
  }
}

export function sql(strings, ...values) {
  const chunks = [];
  strings.forEach((part, i) => {
    chunks.push({ kind: 'text', value: part });
    if (i < values.length) {
      const value = values[i];
      if (value instanceof SqlFragment) {
        chunks.push({ kind: 'fragment', value });
      } else if (value instanceof Column) {
        chunks.push({ kind: 'column', value });
      } else {
        chunks.push({ kind: 'param', value });
      }
    }
  });
  return new SqlFragment(chunks);
}

sql.raw = (text) => new SqlFragment([{ kind: 'text', value: text }]);

class Column {
  constructor(type, name, opts = {}) {
    this.type = type;
    this.name = name;
    this.mode = opts.mode;
    this.modifiers = [];
  }

  primaryKey(opts = {}) {
    this.modifiers.push(opts.autoIncrement ? 'PRIMARY KEY AUTOINCREMENT' : 'PRIMARY KEY');
    return this;
  }

  notNull() {
    this.modifiers.push('NOT NULL');
    return this;
  }

  unique() {
    this.modifiers.push('UNIQUE');
    return this;
  }

  default(value) {
    this.modifiers.push(`DEFAULT ${renderDefault(value, this.mode)}`);
    return this;
  }

  constraint(ddl) {
    this.modifiers.push(ddl);
    return this;
  }

  references() {
    throw new Error('foreign keys are not supported');
  }

  deprecated() {
    this.isDeprecated = true;
    return this;
  }
}

function column(type, defaultMode) {
  return (name, opts = {}) => new Column(type, name, { mode: defaultMode, ...opts });
}

export const integer = column('INTEGER');
export const text = column('TEXT');
export const real = column('REAL');
export const float = real;
export const numeric = column('NUMERIC');
export const blob = column('BLOB');
export const boolean = column('INTEGER', 'boolean');
export const json = column('TEXT', 'json');

class IndexBuilder {
  constructor(name, unique) {
    this.kind = 'index';
    this.name = name;
    this.unique = unique;
    this.columns = [];
    this.condition = null;
  }

  on(...columns) {
    this.columns = columns;
    return this;
  }

  where(condition) {
    this.condition = condition;
    return this;
  }
}

export const index = (name) => new IndexBuilder(name, false);
export const uniqueIndex = (name) => new IndexBuilder(name, true);
export const primaryKey = ({ columns }) => ({ kind: 'primaryKey', columns });
export const unique = (name) => ({ kind: 'unique', name, on: (...columns) => ({ kind: 'unique', name, columns }) });
export const check = (name, condition) => ({ kind: 'check', name, condition });
export const foreignKey = () => {
  throw new Error('foreign keys are not supported');
};

export function table(name, columns, extras) {
  const refs = {};
  for (const [key, col] of Object.entries(columns)) {
    col.name ??= key;
    refs[key] = col;
  }
  const built = extras ? Object.values(extras(refs)) : [];
  return { ...refs, [TABLE]: { name, columns: refs, extras: built } };
}

// The DDL of every table exported by a schema module.
export function schemaDdl(schemaModule) {
  const statements = [];
  for (const value of Object.values(schemaModule)) {
    const meta = value?.[TABLE];
    if (!meta) continue;
    const defs = Object.values(meta.columns)
      .filter((col) => !col.isDeprecated)
      .map((col) => [quote(col.name), col.type, ...col.modifiers].join(' '));
    const indexes = [];
    for (const extra of meta.extras) {
      if (extra.kind === 'primaryKey') {
        defs.push(`PRIMARY KEY (${extra.columns.map(columnSql).join(', ')})`);
      } else if (extra.kind === 'unique') {
        defs.push(`CONSTRAINT ${quote(extra.name)} UNIQUE (${extra.columns.map(columnSql).join(', ')})`);
      } else if (extra.kind === 'check') {
        defs.push(`CONSTRAINT ${quote(extra.name)} CHECK (${extra.condition.renderLiteral()})`);
      } else if (extra.kind === 'index') {
        const where = extra.condition ? ` WHERE ${extra.condition.renderLiteral()}` : '';
        indexes.push(`CREATE ${extra.unique ? 'UNIQUE ' : ''}INDEX ${quote(extra.name)} ON ${quote(meta.name)} `
          + `(${extra.columns.map(columnSql).join(', ')})${where}`);
      }
    }
    statements.push(`CREATE TABLE ${quote(meta.name)} (\n  ${defs.join(',\n  ')}\n)`, ...indexes);
  }
  return statements;
}

let database = new DatabaseSync(':memory:');

// Replaces the database with an empty one holding the given schema.
export function resetDatabase(schemaModule) {
  database.close();
  database = new DatabaseSync(':memory:');
  for (const statement of schemaDdl(schemaModule)) {
    database.exec(statement);
  }
}

function prepare(query, params) {
  if (typeof query === 'string') {
    return { statement: database.prepare(query), params: params === undefined ? [] : [params] };
  }
  const { text: queryText, params: bound } = query.render();
  return { statement: database.prepare(queryText), params: bound };
}

const plain = (row) => (row === undefined ? null : { ...row });

export const db = {
  async run(query, params) {
    const { statement, params: bound } = prepare(query, params);
    if (statement.columns().length > 0) {
      const rows = statement.all(...bound).map(plain);
      return { rowsAffected: rows.length, lastInsertRowid: 0, rows };
    }
    const result = statement.run(...bound);
    return { rowsAffected: Number(result.changes), lastInsertRowid: Number(result.lastInsertRowid), rows: [] };
  },

  async all(query, params) {
    const { statement, params: bound } = prepare(query, params);
    return statement.all(...bound).map(plain);
  },

  async get(query, params) {
    const { statement, params: bound } = prepare(query, params);
    return plain(statement.get(...bound));
  },

  async values(query, params) {
    const { statement, params: bound } = prepare(query, params);
    statement.setReturnArrays(true);
    return statement.all(...bound);
  },

  select() {
    throw new Error('the query builder is not emulated; use raw SQL');
  },
  insert() {
    throw new Error('the query builder is not emulated; use raw SQL');
  },
  update() {
    throw new Error('the query builder is not emulated; use raw SQL');
  },
  delete() {
    throw new Error('the query builder is not emulated; use raw SQL');
  },
};

export default db;

function bindable(value) {
  if (value === undefined) {
    throw new Error('undefined can not be bound to a query');
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Uint8Array)) {
    return JSON.stringify(value);
  }
  return value;
}

function renderDefault(value, mode) {
  if (value instanceof SqlFragment) {
    return value.renderLiteral();
  }
  if (mode === 'json') {
    return `'${JSON.stringify(value).replaceAll("'", "''")}'`;
  }
  if (typeof value === 'string') {
    return `'${value.replaceAll("'", "''")}'`;
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  return String(value);
}

function columnSql(col) {
  return col instanceof SqlFragment ? col.renderLiteral() : quote(col.name);
}

function quote(identifier) {
  return `"${identifier}"`;
}
