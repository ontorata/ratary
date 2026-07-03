/** Minimal Redis Streams command surface for event bus adapter (ADR-016). */
export interface RedisStreamsClient {
  xadd(stream: string, id: string, ...fieldValuePairs: string[]): Promise<string>;
  xread(
    count: number,
    blockMs: number,
    streams: string,
    ...streamKeysAndIds: string[]
  ): Promise<Array<[string, Array<[string, string[]]>]> | null>;
}

export interface RedisStreamsGroupClient extends RedisStreamsClient {
  xgroupCreate(stream: string, group: string, id: string, mkstream?: 'MKSTREAM'): Promise<'OK'>;
  xreadgroup(
    group: string,
    consumer: string,
    count: number,
    blockMs: number,
    streams: string,
    ...streamKeysAndIds: string[]
  ): Promise<Array<[string, Array<[string, string[]]>]> | null>;
  xack(stream: string, group: string, ...ids: string[]): Promise<number>;
}
