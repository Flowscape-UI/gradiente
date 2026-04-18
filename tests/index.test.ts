import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/lexer';

describe('tokenize', () => {
  it('debug output', () => {
    // console.log(tokenize('#ff0000'))
    console.log(tokenize('gradient(rgb(255, 0, 0))'))
    // console.log(tokenize('oklch(0.5 0.2 120)'))

    // console.log(tokens);
  });
});