import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import EditableImage from './EditableImage';

describe('EditableImage', () => {
  it('merender gambar dengan object-fit & object-position', () => {
    const { container } = render(<EditableImage src="/a.jpg" fit="contain" position="20% 80%" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.style.objectFit).toBe('contain');
    expect(img.style.objectPosition).toBe('20% 80%');
  });

  it('tidak menampilkan overlay pan saat mode tamu (editable=false)', () => {
    const { container } = render(<EditableImage src="/a.jpg" />);
    expect(container.querySelector('[title="Geser untuk atur fokus foto"]')).toBeNull();
  });
});
