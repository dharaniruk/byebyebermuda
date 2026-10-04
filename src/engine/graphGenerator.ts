// ============================================================
// DEMO GRAPH SCENARIOS
// ============================================================

import { GraphScenario } from './types';

export const DEMO_SCENARIOS: Record<string, GraphScenario> = {

  simple_cycle: {
    id: 'simple_cycle',
    name: 'Simple Cycle',
    description: 'Classic A → B → C → A loop. Demonstrates basic cycle detection and edge severing.',
    nodes: [
      {
        id: 'home',
        url: 'https://demo.local/home',
        title: 'Home Page',
        links: ['https://demo.local/about', 'https://demo.local/blog'],
      },
      {
        id: 'about',
        url: 'https://demo.local/about',
        title: 'About Us',
        links: ['https://demo.local/contact'],
      },
      {
        id: 'contact',
        url: 'https://demo.local/contact',
        title: 'Contact',
        links: ['https://demo.local/home'], // ← CYCLE back to home
      },
      {
        id: 'blog',
        url: 'https://demo.local/blog',
        title: 'Blog',
        links: ['https://demo.local/home'], // ← CYCLE back to home
      },
    ],
  },

  multiple_cycles: {
    id: 'multiple_cycles',
    name: 'Multiple Cycles',
    description: 'Complex multi-ring loops across products, cart, user reviews, and blog sections.',
    nodes: [
      {
        id: 'home',
        url: 'https://demo.local/home',
        title: 'Home',
        links: ['https://demo.local/products', 'https://demo.local/blog', 'https://demo.local/account'],
      },
      {
        id: 'products',
        url: 'https://demo.local/products',
        title: 'Products Store',
        links: ['https://demo.local/cart', 'https://demo.local/reviews'],
      },
      {
        id: 'cart',
        url: 'https://demo.local/cart',
        title: 'Shopping Cart',
        links: ['https://demo.local/checkout', 'https://demo.local/home'], // ← Loop 1: Cart back to Home
      },
      {
        id: 'checkout',
        url: 'https://demo.local/checkout',
        title: 'Checkout',
        links: ['https://demo.local/products'], // ← Loop 2: Checkout back to Products
      },
      {
        id: 'reviews',
        url: 'https://demo.local/reviews',
        title: 'User Reviews',
        links: ['https://demo.local/products'], // ← Loop 3: Reviews back to Products
      },
      {
        id: 'blog',
        url: 'https://demo.local/blog',
        title: 'Tech Blog',
        links: ['https://demo.local/article-1', 'https://demo.local/home'],
      },
      {
        id: 'article-1',
        url: 'https://demo.local/article-1',
        title: 'Article 1',
        links: ['https://demo.local/blog'], // ← Loop 4: Article back to Blog
      },
      {
        id: 'account',
        url: 'https://demo.local/account',
        title: 'User Account',
        links: ['https://demo.local/home'],
      },
    ],
  },

  duplicate_urls: {
    id: 'duplicate_urls',
    name: 'Duplicate URLs',
    description: 'Demonstrates canonicalization collapsing equivalent URL variants into one node.',
    nodes: [
      {
        id: 'home',
        url: 'https://demo.local/home',
        title: 'Home',
        links: [
          'https://demo.local/page',
          'https://demo.local/page/',
          'https://demo.local/page#top',
          'https://demo.local/page?utm_source=email',
          'https://demo.local/page?ref=home',
          'https://demo.local/products',
        ],
      },
      {
        id: 'page',
        url: 'https://demo.local/page',
        title: 'Landing Page',
        links: ['https://demo.local/products'],
      },
      {
        id: 'products',
        url: 'https://demo.local/products',
        title: 'Products',
        links: ['https://demo.local/home'],
      },
    ],
  },

  broken_links: {
    id: 'broken_links',
    name: 'Broken Links',
    description: 'Graph with 404, 410, and 500 error pages. Crawler safely detects and flags them.',
    nodes: [
      { id: 'home', url: 'https://demo.local/home', title: 'Home', links: ['https://demo.local/valid', 'https://demo.local/missing', 'https://demo.local/about'] },
      { id: 'valid', url: 'https://demo.local/valid', title: 'Valid Page', links: ['https://demo.local/also-gone', 'https://demo.local/about'] },
      { id: 'about', url: 'https://demo.local/about', title: 'About', links: ['https://demo.local/home'] },
      { id: 'missing', url: 'https://demo.local/missing', title: 'Missing Page', links: [], httpStatus: 404 },
      { id: 'also-gone', url: 'https://demo.local/also-gone', title: 'Gone Resource', links: [], httpStatus: 410 },
      { id: 'error-page', url: 'https://demo.local/server-error', title: 'Server Error', links: [], httpStatus: 500 },
    ],
  },

  deep_crawl: {
    id: 'deep_crawl',
    name: 'Deep Graph',
    description: 'A deep branching graph where BFS (Queue) and DFS (Stack) produce visibly different orders.',
    nodes: [
      { id: 'root', url: 'https://demo.local/root', title: 'Root', links: ['https://demo.local/a', 'https://demo.local/b'] },
      { id: 'a', url: 'https://demo.local/a', title: 'A', links: ['https://demo.local/a1', 'https://demo.local/a2'] },
      { id: 'b', url: 'https://demo.local/b', title: 'B', links: ['https://demo.local/b1', 'https://demo.local/b2'] },
      { id: 'a1', url: 'https://demo.local/a1', title: 'A1', links: ['https://demo.local/a1-1', 'https://demo.local/a1-2'] },
      { id: 'a2', url: 'https://demo.local/a2', title: 'A2', links: ['https://demo.local/a2-1'] },
      { id: 'b1', url: 'https://demo.local/b1', title: 'B1', links: ['https://demo.local/b1-1'] },
      { id: 'b2', url: 'https://demo.local/b2', title: 'B2', links: ['https://demo.local/root'] },
      { id: 'a1-1', url: 'https://demo.local/a1-1', title: 'A1-1', links: ['https://demo.local/leaf-1'] },
      { id: 'a1-2', url: 'https://demo.local/a1-2', title: 'A1-2', links: [] },
      { id: 'a2-1', url: 'https://demo.local/a2-1', title: 'A2-1', links: ['https://demo.local/root'] },
      { id: 'b1-1', url: 'https://demo.local/b1-1', title: 'B1-1', links: [] },
      { id: 'leaf-1', url: 'https://demo.local/leaf-1', title: 'Leaf 1', links: [] },
    ],
  },

  large_graph: {
    id: 'large_graph',
    name: 'Large Graph (20 Nodes)',
    description: 'A 20-node graph with multiple branches, dead ends, and cross-linked cycles.',
    nodes: [
      { id: 'home', url: 'https://demo.local/home', title: 'Home', links: ['https://demo.local/about', 'https://demo.local/products', 'https://demo.local/blog', 'https://demo.local/contact'] },
      { id: 'about', url: 'https://demo.local/about', title: 'About', links: ['https://demo.local/team', 'https://demo.local/mission'] },
      { id: 'products', url: 'https://demo.local/products', title: 'Products', links: ['https://demo.local/laptops', 'https://demo.local/phones', 'https://demo.local/tablets'] },
      { id: 'blog', url: 'https://demo.local/blog', title: 'Blog', links: ['https://demo.local/article-1', 'https://demo.local/article-2', 'https://demo.local/article-3', 'https://demo.local/home'] },
      { id: 'contact', url: 'https://demo.local/contact', title: 'Contact', links: ['https://demo.local/home'] },
      { id: 'team', url: 'https://demo.local/team', title: 'Team', links: ['https://demo.local/about'] },
      { id: 'mission', url: 'https://demo.local/mission', title: 'Mission', links: ['https://demo.local/about', 'https://demo.local/home'] },
      { id: 'laptops', url: 'https://demo.local/laptops', title: 'Laptops', links: ['https://demo.local/products', 'https://demo.local/laptop-1', 'https://demo.local/laptop-2'] },
      { id: 'phones', url: 'https://demo.local/phones', title: 'Phones', links: ['https://demo.local/products'] },
      { id: 'tablets', url: 'https://demo.local/tablets', title: 'Tablets', links: ['https://demo.local/products', 'https://demo.local/home'] },
      { id: 'article-1', url: 'https://demo.local/article-1', title: 'Article 1', links: ['https://demo.local/blog', 'https://demo.local/article-2'] },
      { id: 'article-2', url: 'https://demo.local/article-2', title: 'Article 2', links: ['https://demo.local/blog', 'https://demo.local/home'] },
      { id: 'article-3', url: 'https://demo.local/article-3', title: 'Article 3', links: ['https://demo.local/blog'] },
      { id: 'laptop-1', url: 'https://demo.local/laptop-1', title: 'Laptop Model A', links: ['https://demo.local/laptops', 'https://demo.local/laptop-2'] },
      { id: 'laptop-2', url: 'https://demo.local/laptop-2', title: 'Laptop Model B', links: ['https://demo.local/laptops', 'https://demo.local/laptop-1'] },
      { id: 'careers', url: 'https://demo.local/careers', title: 'Careers', links: ['https://demo.local/home', 'https://demo.local/team'] },
      { id: 'pricing', url: 'https://demo.local/pricing', title: 'Pricing', links: ['https://demo.local/products', 'https://demo.local/contact'] },
      { id: 'docs', url: 'https://demo.local/docs', title: 'Documentation', links: ['https://demo.local/home', 'https://demo.local/api'] },
      { id: 'api', url: 'https://demo.local/api', title: 'API Reference', links: ['https://demo.local/docs'] },
      { id: 'support', url: 'https://demo.local/support', title: 'Support', links: ['https://demo.local/contact', 'https://demo.local/home'] },
    ],
  },
};

export const DEFAULT_SCENARIO = DEMO_SCENARIOS['simple_cycle'];

export const SCENARIO_LIST = Object.values(DEMO_SCENARIOS);
