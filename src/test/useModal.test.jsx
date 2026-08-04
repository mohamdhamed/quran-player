/**
 * useModal Tests
 *
 * قبل الهوك ده، المودالات ما كانتش بتقفل بـ Escape، والفوكس كان بيهرب
 * للصفحة اللي وراها، وما كانش بيرجع مكانه بعد القفل.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useModal } from '../hooks/useModal';

function Modal({ isOpen, onClose }) {
  const ref = useModal(isOpen, onClose);
  if (!isOpen) return null;
  return (
    <div ref={ref} role="dialog" aria-modal="true" tabIndex={-1}>
      <button>الأول</button>
      <button>التاني</button>
      <button>الأخير</button>
    </div>
  );
}

function Page({ open, onClose }) {
  return (
    <>
      <button>زرار برّه</button>
      <Modal isOpen={open} onClose={onClose} />
    </>
  );
}

describe('useModal', () => {
  it('بيدّي الفوكس لأول عنصر جوه المودال', () => {
    render(<Page open onClose={() => {}} />);

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'الأول' }));
  });

  it('Escape بيقفل المودال', async () => {
    const onClose = vi.fn();
    render(<Page open onClose={onClose} />);

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Tab من آخر عنصر بيرجع لأول عنصر مش للصفحة ورا', async () => {
    render(<Page open onClose={() => {}} />);
    const last = screen.getByRole('button', { name: 'الأخير' });
    last.focus();

    await userEvent.tab();

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'الأول' }));
  });

  it('Shift+Tab من أول عنصر بيلف للأخير', async () => {
    render(<Page open onClose={() => {}} />);
    screen.getByRole('button', { name: 'الأول' }).focus();

    await userEvent.tab({ shift: true });

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'الأخير' }));
  });

  it('الفوكس بيرجع للعنصر اللي فتح المودال بعد ما يتقفل', () => {
    const { rerender } = render(<Page open={false} onClose={() => {}} />);
    const opener = screen.getByRole('button', { name: 'زرار برّه' });
    opener.focus();

    rerender(<Page open onClose={() => {}} />);
    expect(document.activeElement).not.toBe(opener);

    rerender(<Page open={false} onClose={() => {}} />);
    expect(document.activeElement).toBe(opener);
  });
});
