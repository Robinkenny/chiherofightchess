/** 三國武將／三国志系視覺：朱金墨 + 勢力色（原創程式繪製） */
export const INK = {
  paper: '#e8dcc4',
  paperDark: '#c9b896',
  ink: '#1a1208',
  inkSoft: '#3d3020',
  gold: '#c9a227',
  goldLight: '#f0d878',
  crimson: '#8b1c1c',
  crimsonBright: '#c42b2b',
  jade: '#2d6a4f',
  river: '#3a6d8c',
  mist: 'rgba(255,255,255,0.12)',
};

export const DYNASTY_ACCENT: Record<string, { rim: string; banner: string }> = {
  三國: { rim: '#c9a227', banner: '#8b1c1c' },
  漢: { rim: '#b8860b', banner: '#8b0000' },
  秦: { rim: '#4a4a4a', banner: '#2c2c2c' },
  戰國: { rim: '#6b4423', banner: '#4a3728' },
  唐: { rim: '#d4af37', banner: '#1e3a5f' },
  宋: { rim: '#c9a227', banner: '#8b4513' },
  明: { rim: '#b22222', banner: '#1a1a1a' },
  清: { rim: '#ffd700', banner: '#004488' },
  隋: { rim: '#708090', banner: '#2f4f4f' },
  東晉: { rim: '#8fbc8f', banner: '#556b2f' },
  南朝: { rim: '#cd853f', banner: '#8b4513' },
  北朝: { rim: '#4682b4', banner: '#2e4a62' },
  春秋: { rim: '#8b7355', banner: '#5c4033' },
  秦末: { rim: '#a0522d', banner: '#4a0404' },
  新: { rim: '#9370db', banner: '#4b0082' },
  前秦: { rim: '#daa520', banner: '#556b2f' },
  十六國: { rim: '#bc8f8f', banner: '#696969' },
  北魏: { rim: '#2e8b57', banner: '#1c3a2a' },
  北齊: { rim: '#dc143c', banner: '#4a0010' },
  西魏: { rim: '#5f9ea0', banner: '#2f4f4f' },
};

export function dynastyStyle(dynasty: string) {
  return DYNASTY_ACCENT[dynasty] ?? { rim: INK.gold, banner: INK.crimson };
}

export function hashHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}
