// Centralized icon map for the application
export const ICON_MAP = {
    Mic: 'Mic',
    Repeat: 'Repeat',
    Image: 'Image',
    Headphones: 'Headphones',
    MessageCircle: 'MessageCircle',
    MessageSquare: 'MessageSquare',
    Users: 'Users',
    FileText: 'FileText',
    List: 'List',
    AlignLeft: 'AlignLeft',
    Square: 'Square',
    DragDrop: 'DragDrop',
    Highlighter: 'Highlighter',
    QuestionMark: 'QuestionMark',
    Keyboard: 'Keyboard',
    Book: 'Book'
} as const

export type IconKey = keyof typeof ICON_MAP

export default ICON_MAP
