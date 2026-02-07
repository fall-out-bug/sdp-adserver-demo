import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Input } from './Input';

describe('Input', () => {
  it('renders label and input', () => {
    render(<Input label="Email" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<Input label="Name" value="John" onChange={() => {}} />);
    const input = screen.getByLabelText('Name') as HTMLInputElement;
    expect(input.value).toBe('John');
  });

  it('calls onChange when value changes', () => {
    let newValue = '';
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      newValue = e.target.value;
    };
    render(<Input label="Name" value="" onChange={handleChange} />);
    const input = screen.getByLabelText('Name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Jane' } });
    expect(newValue).toBe('Jane');
  });

  it('displays error message when provided', () => {
    render(<Input label="Email" value="" onChange={() => {}} error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('applies required attribute', () => {
    render(<Input label="Name" value="" onChange={() => {}} required />);
    const input = screen.getByLabelText('Name') as HTMLInputElement;
    expect(input.required).toBe(true);
  });

  it('sets input type correctly', () => {
    render(<Input label="Password" value="" onChange={() => {}} type="password" />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
  });
});
