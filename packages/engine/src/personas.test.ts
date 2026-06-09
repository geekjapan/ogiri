import { describe, expect, it } from 'vitest';
import { PERSONA_TEMPLATES, getPersona, loadPersonas } from './personas.js';
import type { Persona } from './types.js';

describe('personas', () => {
  it('初期セットは 4〜5 体で、id・name・few-shot を持つ', () => {
    expect(PERSONA_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    expect(PERSONA_TEMPLATES.length).toBeLessThanOrEqual(5);
    for (const p of PERSONA_TEMPLATES) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.fewShot.length).toBeGreaterThan(0);
    }
  });

  it('getPersona は id で引け、未知はエラー', () => {
    expect(getPersona('dokuzetsu').name).toBe('毒島センセ');
    expect(() => getPersona('unknown')).toThrow();
  });

  it('loadPersonas は同 id を上書き、新 id を追加する', () => {
    const custom: Persona = {
      id: 'dokuzetsu',
      name: '上書き',
      style: 's',
      speech: 'p',
      specialty: 't',
      fewShot: ['x'],
    };
    const added: Persona = {
      id: 'new1',
      name: '新キャラ',
      style: 's',
      speech: 'p',
      specialty: 't',
      fewShot: ['y'],
    };
    const loaded = loadPersonas([custom, added]);
    expect(getPersona('dokuzetsu', loaded).name).toBe('上書き');
    expect(getPersona('new1', loaded).name).toBe('新キャラ');
    expect(loaded.length).toBe(PERSONA_TEMPLATES.length + 1);
  });
});
