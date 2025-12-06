/**
 * WaveAnimation Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WaveAnimation from '../components/UI/WaveAnimation';

describe('WaveAnimation', () => {
  it('renders with default props', () => {
    const { container } = render(<WaveAnimation />);
    const bars = container.querySelectorAll('.animate-wave');
    expect(bars).toHaveLength(4);
  });

  it('renders with custom bar count', () => {
    const { container } = render(<WaveAnimation bars={3} />);
    const bars = container.querySelectorAll('.animate-wave');
    expect(bars).toHaveLength(3);
  });

  it('applies correct size classes', () => {
    const { container: small } = render(<WaveAnimation size="sm" />);
    const { container: large } = render(<WaveAnimation size="lg" />);
    
    expect(small.querySelector('.w-0\\.5')).toBeTruthy();
    expect(large.querySelector('.w-1')).toBeTruthy();
  });

  it('applies correct color classes', () => {
    const { container: white } = render(<WaveAnimation color="white" />);
    const { container: green } = render(<WaveAnimation color="green" />);
    
    expect(white.querySelector('.bg-white')).toBeTruthy();
    expect(green.querySelector('.bg-spotify-green')).toBeTruthy();
  });
});
