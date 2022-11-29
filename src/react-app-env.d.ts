/// <reference types="react-scripts" />

type UVEncode = (encoded: string) => string;
type UVDecode = (encoded: string) => string;

interface UVConfig {
  bare: string;
  prefix: string;
  handler: string;
  bundle: string;
  config: string;
  client: string;
  sw: string;
  encodeUrl: UVEncode;
  decodeUrl: UVDecode;
}

declare const __uv$config: UVConfig;
