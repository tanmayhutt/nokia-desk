export const LINKS = {
  portfolio: 'https://tanmaytiwari.me/',
  resume: 'https://tanmaytiwari.me/resume/',
  github: 'https://github.com/tanmayhutt',
  repos: 'https://github.com/tanmayhutt?tab=repositories',
  email: 'mailto:tiwaritanmay1021@gmail.com',
}

export const PROFILE = {
  name: 'Tanmay',
  operator: 'tanmayhutt',
  about: [
    "Hi! I'm Tanmay.",
    'A student building web products, developer tools and small systems.',
    'I also work with Linux, interfaces and video.',
  ],
  contacts: [
    { label: 'Portfolio', value: 'tanmaytiwari.me', url: LINKS.portfolio },
    { label: 'GitHub', value: '@tanmayhutt', url: LINKS.github },
    { label: 'LinkedIn', value: 'Tanmay Tiwari', url: 'https://www.linkedin.com/in/tanmay-tiwari-72719526a/' },
    { label: 'Instagram', value: '@tanmayhutt', url: 'https://www.instagram.com/tanmayhutt/' },
    { label: 'YouTube', value: '@saul.3gp', url: 'https://www.youtube.com/@saul.3gp' },
    { label: 'Email', value: 'Write to me', url: LINKS.email },
  ],
  projects: [
    { name: 'Blend', desc: 'Compare YouTube tastes', url: 'https://github.com/tanmayhutt/blend' },
    { name: 'Thwip', desc: 'Hub for coding agents', url: 'https://github.com/tanmayhutt/thwip-cli' },
    { name: 'Arch server', desc: 'Self-hosted Arch node', url: 'https://github.com/tanmayhutt/arch-server' },
    { name: 'FilmedIn', desc: 'Track films, playlists', url: 'https://github.com/tanmayhutt/FilmedIn' },
    { name: 'WiFiSense', desc: 'Wi-Fi presence sensing', url: 'https://github.com/tanmayhutt/WiFiSense' },
    { name: 'More repos', desc: 'All work on GitHub', url: LINKS.repos },
  ],
  desks: [
    { label: 'Portfolio', value: 'Main site', url: LINKS.portfolio, sameTab: true },
    { label: 'Linux desk', value: 'Sibling desk', url: '/linux-desk/', sameTab: true },
    { label: 'Spotify desk', value: 'Sibling desk', url: '/spotify-desk/', sameTab: true },
  ],
}

/* 16x16 pixel bitmaps. "#" is an ink pixel. */
const BITMAPS = {
  messages: [
    '................',
    '################',
    '##............##',
    '#.#..........#.#',
    '#..#........#..#',
    '#...#......#...#',
    '#....#....#....#',
    '#.....####.....#',
    '#..............#',
    '#..............#',
    '################',
  ],
  contacts: [
    '..############..',
    '.##..........#..',
    '..#...####...#..',
    '.##...####...#..',
    '..#...####...#..',
    '.##....##....#..',
    '..#..######..#..',
    '.##.########.#..',
    '..#.########.#..',
    '.##..........#..',
    '..############..',
  ],
  projects: [
    '.#####..........',
    '#.....#########.',
    '#..............#',
    '################',
    '#..............#',
    '#..............#',
    '#..............#',
    '#..............#',
    '#..............#',
    '################',
  ],
  resume: [
    '..#########.....',
    '..#.......##....',
    '..#.......#.#...',
    '..#.......####..',
    '..#..........#..',
    '..#.#######..#..',
    '..#..........#..',
    '..#.#####....#..',
    '..#..........#..',
    '..#.######...#..',
    '..#..........#..',
    '..############..',
  ],
  snake: [
    '............##..',
    '............##..',
    '................',
    '##########......',
    '##########......',
    '........##......',
    '........##......',
    '..########......',
    '..########......',
    '..##............',
    '..##............',
    '..############..',
    '..##########.##.',
  ],
  terminal: [
    '################',
    '#..............#',
    '#.#............#',
    '#..#...........#',
    '#.#..####......#',
    '#..............#',
    '#..............#',
    '################',
    '......####......',
    '...##########...',
  ],
  desks: [
    '.....###########',
    '.....###########',
    '..###########..#',
    '..###########..#',
    '###########.#..#',
    '###########.#..#',
    '#.........#.#..#',
    '#.........#.####',
    '#.........#.#...',
    '#.........###...',
    '#.........#.....',
    '###########.....',
  ],
  profiles: [
    '......#.........',
    '.....##......#..',
    '....###...#...#.',
    '#######....#..#.',
    '#######.#..#...#',
    '#######.#..#...#',
    '#######....#..#.',
    '....###...#...#.',
    '.....##......#..',
    '......#.........',
  ],
  power: [
    '.......##.......',
    '...#...##...#...',
    '..##...##...##..',
    '.##....##....##.',
    '.#.....##.....#.',
    '##............##',
    '##............##',
    '.#............#.',
    '.##..........##.',
    '..###......###..',
    '....########....',
  ],
}

export function PixelIcon({ name, className = '' }) {
  const rows = BITMAPS[name] || []
  const offset = (16 - rows.length) / 2
  const rects = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (row[x] === '#') {
        let w = 1
        while (row[x + w] === '#') w++
        rects.push(<rect key={`${x}-${y}`} x={x} y={y + offset} width={w} height={1} />)
        x += w
      } else {
        x++
      }
    }
  })
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
      {rects}
    </svg>
  )
}

export const MENU = [
  { id: 'messages', label: 'Messages' },
  { id: 'contacts', label: 'Phonebook' },
  { id: 'projects', label: 'Projects' },
  { id: 'resume', label: 'Resume' },
  { id: 'snake', label: 'Snake' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'desks', label: 'Desks' },
  { id: 'profiles', label: 'Profiles' },
]
