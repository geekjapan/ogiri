import { describe, expect, it, vi } from 'vitest';
import { Ledger } from './ledger.js';
import { runRound } from './round.js';
import type { AnswerFn, JudgeFn, Persona, Seat, Topic } from './types.js';

const persona = (id: string): Persona => ({
  id,
  name: `名前${id}`,
  style: '芸風',
  speech: '口調',
  specialty: '得意技',
  fewShot: [],
});

const seat = (id: string, provider = 'stub'): Seat => ({
  id,
  persona: persona(id),
  model: { provider, model: `${provider}-model` },
});

const topic: Topic = { id: 't1', text: 'もしも猫が総理大臣だったら' };

describe('runRound', () => {
  it('hello round: 回答収集→審査→台帳反映が一気通貫で動く', async () => {
    const seats = [seat('s1')];
    const answer: AnswerFn = async () => ({ ok: true, text: 'ニャーと所信表明' });
    const judge: JudgeFn = async (_t, anon) =>
      anon.map((a) => ({ label: a.label, delta: 1, reason: 'キレがある' }));
    const ledger = new Ledger(['s1']);

    const result = await runRound({ topic, seats, answer, judge, ledger });

    expect(result.answers).toHaveLength(1);
    expect(result.answers[0]).toMatchObject({ seatId: 's1', passed: false, model: 'stub-model' });
    expect(result.verdicts).toEqual([{ seatId: 's1', delta: 1, reason: 'キレがある' }]);
    expect(result.ledger).toEqual({ s1: 1 });
  });

  it('回答を並列に収集する', async () => {
    const seats = [seat('s1'), seat('s2'), seat('s3')];
    let active = 0;
    let maxActive = 0;
    const answer: AnswerFn = async (_t, s) => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 10));
      active--;
      return { ok: true, text: `回答 by ${s.id}` };
    };
    const judge: JudgeFn = async (_t, anon) =>
      anon.map((a) => ({ label: a.label, delta: 0, reason: '' }));
    const ledger = new Ledger(['s1', 's2', 's3']);

    await runRound({ topic, seats, answer, judge, ledger });
    expect(maxActive).toBe(3); // 逐次なら 1 のはず
  });

  it('失敗した席はパス扱いになり、審査に出さず番組を止めない', async () => {
    const seats = [seat('s1'), seat('s2')];
    const answer: AnswerFn = async (_t, s) =>
      s.id === 's2' ? { ok: false, reason: 'timeout' } : { ok: true, text: 'ボケ' };
    const judge = vi.fn<JudgeFn>(async (_t, anon) =>
      anon.map((a) => ({ label: a.label, delta: 1, reason: 'ok' })),
    );
    const ledger = new Ledger(['s1', 's2']);

    const result = await runRound({ topic, seats, answer, judge, ledger });

    const s2 = result.answers.find((a) => a.seatId === 's2');
    expect(s2).toMatchObject({ passed: true, passReason: 'timeout', text: '' });
    // 審査には生きている回答（s1）だけが渡る
    expect(judge).toHaveBeenCalledTimes(1);
    expect(judge.mock.calls[0]?.[1]).toHaveLength(1);
    // パスした席は座布団変動なし
    expect(result.ledger).toEqual({ s1: 1, s2: 0 });
  });

  it('回答関数が例外を投げてもパスに丸めて継続する', async () => {
    const seats = [seat('s1'), seat('s2')];
    const answer: AnswerFn = async (_t, s) => {
      if (s.id === 's1') throw new Error('network down');
      return { ok: true, text: '生存' };
    };
    const judge: JudgeFn = async (_t, anon) =>
      anon.map((a) => ({ label: a.label, delta: 0, reason: '' }));
    const ledger = new Ledger(['s1', 's2']);

    const result = await runRound({ topic, seats, answer, judge, ledger });
    expect(result.answers.find((a) => a.seatId === 's1')).toMatchObject({ passed: true });
    expect(result.answers.find((a) => a.seatId === 's2')).toMatchObject({ passed: false });
  });

  it('提示順シャッフルを注入しても裁定は正しい席に復元される', async () => {
    const seats = [seat('s1'), seat('s2')];
    const answer: AnswerFn = async (_t, s) => ({ ok: true, text: `T-${s.id}` });
    // 審査は「表示1番目（回答1）にだけ +1」を返す
    const judge: JudgeFn = async (_t, anon) =>
      anon.map((a) => ({ label: a.label, delta: a.label === '回答1' ? 1 : 0, reason: 'top' }));
    const ledger = new Ledger(['s1', 's2']);
    // order を逆順に固定 → 表示1番目は元 index1 (s2)
    const result = await runRound({ topic, seats, answer, judge, ledger, order: () => [1, 0] });
    expect(result.ledger).toEqual({ s1: 0, s2: 1 });
  });
});
