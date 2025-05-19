import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from '../src/app/page';

describe('Home Page', () => {
  it('renders the Next.js logo', () => {
    render(<Page />);

    const logo = screen.getByAltText('Next.js logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders the Deploy now link', () => {
    render(<Page />);

    const deployLink = screen.getByRole('link', { name: /deploy now/i });
    expect(deployLink).toBeInTheDocument();
    expect(deployLink).toHaveAttribute('href', expect.stringContaining('vercel.com'));
  });

  it('renders Learn, Examples, and Go to nextjs.org → links', () => {
    render(<Page />);

    expect(screen.getByRole('link', { name: /learn/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /examples/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to nextjs.org/i })).toBeInTheDocument();
  });

  it('contains the code snippet path', () => {
    render(<Page />);

    expect(screen.getByText('src/app/page.tsx')).toBeInTheDocument();
  });
});
