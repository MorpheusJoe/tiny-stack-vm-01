import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join as j } from "node:path";

const I = process.env.MAKEFUN_INPUT_DIR ?? "/input";
const O = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Run one program of the tiny stack ISA (see kit ISA.md) on its input bytes.
// Returns [stdout bytes, exit code]. Traps end the run with their own code.
function run(p, inp) {
  const n = p.length;
  const D = new Int32Array(256);
  let sp = 0;
  const C = new Int32Array(64);
  let cp = 0;
  const M = new Int32Array(256);
  const out = new Uint8Array(65536);
  let ol = 0, ip = 0, pc = 0, st = 0;
  const end = (code) => [out.subarray(0, ol), code];
  for (;;) {
    if (st === 1000000) return end(10);
    if (pc < 0 || pc >= n) return end(9);
    const o = p[pc];
    const im = o === 1 ? 1 : o === 2 ? 4 : o >= 48 && o <= 51 ? 2 : 0;
    if (pc + im >= n) return end(9);
    st++;
    const nx = pc + 1 + im;
    pc = nx;
    switch (o) {
      case 0:
        return end(0);
      case 1:
        if (sp > 255) return end(3);
        D[sp++] = (p[nx - 1] << 24) >> 24;
        break;
      case 2:
        if (sp > 255) return end(3);
        D[sp++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24);
        break;
      case 3:
        if (sp < 1) return end(2);
        sp--;
        break;
      case 4:
        if (sp < 1) return end(2);
        if (sp > 255) return end(3);
        D[sp] = D[sp - 1];
        sp++;
        break;
      case 5: {
        if (sp < 2) return end(2);
        const t = D[sp - 1];
        D[sp - 1] = D[sp - 2];
        D[sp - 2] = t;
        break;
      }
      case 6:
        if (sp < 2) return end(2);
        if (sp > 255) return end(3);
        D[sp] = D[sp - 2];
        sp++;
        break;
      case 7: {
        if (sp < 3) return end(2);
        const a = D[sp - 3];
        D[sp - 3] = D[sp - 2];
        D[sp - 2] = D[sp - 1];
        D[sp - 1] = a;
        break;
      }
      case 0x10:
      case 0x11:
      case 0x12:
      case 0x13:
      case 0x14:
      case 0x15:
      case 0x16:
      case 0x18:
      case 0x19:
      case 0x1a:
      case 0x1c:
      case 0x1d:
      case 0x1e:
      case 0x20:
      case 0x21:
      case 0x22: {
        if (sp < 2) return end(2);
        const b = D[sp - 1];
        const a = D[sp - 2];
        let r;
        if (o === 0x10) r = (a + b) | 0;
        else if (o === 0x11) r = (a - b) | 0;
        else if (o === 0x12) r = Math.imul(a, b);
        else if (o === 0x13) {
          if (b === 0) return end(4);
          r = a === -2147483648 && b === -1 ? a : (a / b) | 0;
        } else if (o === 0x14) {
          if (b === 0) return end(4);
          r = b === -1 ? 0 : (a % b) | 0;
        } else if (o === 0x15) {
          if (b === 0) return end(4);
          r = Math.floor((a >>> 0) / (b >>> 0)) | 0;
        } else if (o === 0x16) {
          if (b === 0) return end(4);
          r = ((a >>> 0) % (b >>> 0)) | 0;
        } else if (o === 0x18) r = a & b;
        else if (o === 0x19) r = a | b;
        else if (o === 0x1a) r = a ^ b;
        else if (o === 0x1c) r = a << (b & 31);
        else if (o === 0x1d) r = a >> (b & 31);
        else if (o === 0x1e) r = (a >>> (b & 31)) | 0;
        else if (o === 0x20) r = a === b ? 1 : 0;
        else if (o === 0x21) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        sp -= 2;
        D[sp++] = r;
        break;
      }
      case 0x17:
        if (sp < 1) return end(2);
        D[sp - 1] = -D[sp - 1] | 0;
        break;
      case 0x1b:
        if (sp < 1) return end(2);
        D[sp - 1] = ~D[sp - 1];
        break;
      case 0x30: {
        const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
        pc = nx + rel;
        break;
      }
      case 0x31:
      case 0x32: {
        if (sp < 1) return end(2);
        const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
        const v = D[--sp];
        if ((o === 0x31) === (v === 0)) pc = nx + rel;
        break;
      }
      case 0x33:
        if (cp === 64) return end(7);
        C[cp++] = nx;
        pc = p[nx - 2] | (p[nx - 1] << 8);
        break;
      case 0x34:
        if (cp === 0) return end(8);
        pc = C[--cp];
        break;
      case 0x40: {
        if (sp < 1) return end(2);
        const a = D[sp - 1];
        if (a < 0 || a > 255) return end(6);
        D[sp - 1] = M[a];
        break;
      }
      case 0x41: {
        if (sp < 2) return end(2);
        const a = D[sp - 1];
        const v = D[sp - 2];
        if (a < 0 || a > 255) return end(6);
        sp -= 2;
        M[a] = v;
        break;
      }
      case 0x50: {
        if (sp < 1) return end(2);
        const s = String(D[sp - 1]);
        if (ol + s.length > 65536) return end(11);
        sp--;
        for (let i = 0; i < s.length; i++) out[ol++] = s.charCodeAt(i);
        break;
      }
      case 0x51:
        if (sp < 1) return end(2);
        if (ol + 1 > 65536) return end(11);
        out[ol++] = D[--sp] & 255;
        break;
      case 0x52:
        if (sp > 255) return end(3);
        D[sp++] = ip < inp.length ? inp[ip++] : -1;
        break;
      case 0x53:
        if (sp < 1) return end(2);
        return end(D[--sp] & 255);
      default:
        return end(5);
    }
  }
}

for (const id of readdirSync(I).sort()) {
  let prog;
  try {
    prog = readFileSync(j(I, id, "program.bin"));
  } catch {
    continue;
  }
  let inp;
  try {
    inp = readFileSync(j(I, id, "input.bin"));
  } catch {
    inp = Buffer.alloc(0);
  }
  const [o, e] = run(prog, inp);
  mkdirSync(j(O, id), { recursive: true });
  writeFileSync(j(O, id, "stdout.bin"), o);
  writeFileSync(j(O, id, "exit.txt"), String(e));
}
