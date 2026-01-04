/**
 * BookingViewSwitcher Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BookingViewSwitcher } from './BookingViewSwitcher';

describe('BookingViewSwitcher', () => {
  it('should render without errors', () => {
    const onChange = vi.fn();
    const { container } = render(
      <BookingViewSwitcher viewMode="table" onChange={onChange} />
    );
    
    expect(container).toBeTruthy();
  });

  it('should accept different view modes', () => {
    const onChange = vi.fn();
    
    const { rerender } = render(
      <BookingViewSwitcher viewMode="table" onChange={onChange} />
    );
    
    rerender(<BookingViewSwitcher viewMode="calendar" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled(); // onChange only called on user interaction
    
    rerender(<BookingViewSwitcher viewMode="list" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });
});

