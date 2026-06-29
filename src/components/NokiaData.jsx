export const PROFILE = {
  name: "Tanmay",
  operator: "tanmayhutt",
  available: true,
  about: [
    "Hi! I'm Tanmay.",
    "A developer who builds for the web.",
    "Full-stack. Based in India."
  ],
  contacts: [
    { label: "GitHub HQ", value: "Dial: @tanmayhutt", url: "https://github.com/tanmayhutt" },
    { label: "LinkedIn Office", value: "Dial: in/tanmay-tiwari", url: "https://www.linkedin.com/in/tanmay-tiwari-72719526a/" },
    { label: "Insta Hotline", value: "Dial: @tanmayhutt", url: "https://www.instagram.com/tanmayhutt/" },
    { label: "YouTube Studio", value: "Dial: @@saul.3gp", url: "https://www.youtube.com/@saul.3gp" },
    { label: "Direct Email", value: "tiwaritanmay1021...", url: "mailto:tiwaritanmay1021@gmail.com" },
    { label: "Saul Goodman", value: "Dial: (505) 503-4455", url: "https://bettercallsaul.amc.com/" },
  ],
  projects: [
    { name: "Nokia Desk", desc: "This portfolio!", content: "A 3D interactive portfolio inspired by retro electronics." },
    { name: "Project Two", desc: "Coming soon...", content: "Details about project two..." },
    { name: "Project Three", desc: "In the works...", content: "Details about project three..." },
  ]
}

import React from 'react';

const IconPhonebook = () => (
  <svg viewBox="0 0 16 16" width="100%" height="100%" fill="currentColor" style={{ shapeRendering: 'crispEdges' }}>
    <path d="M4,2 h8 v12 h-8 z M2,3 h2 v2 h-2 z M2,6 h2 v2 h-2 z M2,9 h2 v2 h-2 z" />
  </svg>
)

const IconProjects = () => (
  <svg viewBox="0 0 16 16" width="100%" height="100%" fill="currentColor" style={{ shapeRendering: 'crispEdges' }}>
    <path d="M2,3 h5 l2,2 h5 v8 h-12 z M3,6 h10 v1 h-10 z M3,8 h8 v1 h-8 z" />
  </svg>
)

const IconGitHub = () => (
  <svg viewBox="0 0 16 16" width="100%" height="100%" fill="currentColor" style={{ shapeRendering: 'crispEdges' }}>
    <path d="M3,5 h10 v6 h-10 z" />
    <rect x="3" y="3" width="2" height="2" />
    <rect x="11" y="3" width="2" height="2" />
    {/* Eyes */}
    <rect x="5" y="7" width="2" height="2" fill="#879E66" />
    <rect x="9" y="7" width="2" height="2" fill="#879E66" />
    <rect x="5" y="11" width="6" height="3" />
  </svg>
)

const IconInsta = () => (
  <svg viewBox="0 0 16 16" width="100%" height="100%" fill="currentColor" style={{ shapeRendering: 'crispEdges' }}>
    <path d="M3,3 h10 v10 h-10 z" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="6" y="6" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="10" y="4" width="2" height="2" />
  </svg>
)

const IconSnake = () => (
  <svg viewBox="0 0 16 16" width="100%" height="100%" fill="currentColor" style={{ shapeRendering: 'crispEdges' }}>
    <path d="M2,12 h10 v-4 h-6 v-4 h6" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="12" y="3" width="3" height="3" />
    <rect x="2" y="3" width="2" height="2" />
  </svg>
)

const IconTerminal = () => (
  <svg viewBox="0 0 16 16" width="100%" height="100%" fill="currentColor" style={{ shapeRendering: 'crispEdges' }}>
    <path d="M2,3 h12 v8 h-12 z" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="4" y="5" width="2" height="2" />
    <rect x="7" y="7" width="3" height="1" />
    <rect x="6" y="11" width="4" height="2" />
    <rect x="4" y="13" width="8" height="1" />
  </svg>
)

export const MENU = [
  { id: 'contacts', icon: <IconPhonebook />, label: 'Phonebook' },
  { id: 'projects', icon: <IconProjects />, label: 'Projects' },
  { id: 'github', icon: <IconGitHub />, label: 'GitHub' },
  { id: 'instagram', icon: <IconInsta />, label: 'Instagram' },
  { id: 'snake', icon: <IconSnake />, label: 'Snake' },
  { id: 'terminal', icon: <IconTerminal />, label: 'Terminal' },
]
