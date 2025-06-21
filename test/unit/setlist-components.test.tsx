import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SetListProxy, captureNode } from '../../src/component'
import { SetList } from '../../src/model'

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() => ({
    toBlob: vi.fn((callback) => callback(new Blob(['fake image'], { type: 'image/png' })))
  }))
}))

// Mock logo import
vi.mock('../../src/logo.png', () => ({
  default: 'mock-logo.png'
}))

describe('SetListProxy', () => {
  const mockQrCodeURL = 'data:image/png;base64,mockqrcode'
  
  const baseSetlist: SetList = {
    meta: {
      createDate: '2024-01-01T00:00:00Z',
      version: '1.0'
    },
    band: {
      name: 'Test Band'
    },
    event: {
      name: 'Test Event',
      date: '2024-01-01',
      openTime: '18:00',
      startTime: '19:00'
    },
    playings: [
      {
        _id: '1',
        title: 'Song One',
        note: 'Opening song'
      },
      {
        _id: '2',
        title: 'Song Two',
        note: ''
      }
    ],
    theme: 'mqtn',
    displayName: 'Test Band/Test Event'
  }

  describe('theme routing', () => {
    it('should render MQTNSetlist for mqtn theme', () => {
      render(<SetListProxy {...baseSetlist} theme="mqtn" qrCodeURL={mockQrCodeURL} />)
      
      expect(screen.getByText('Test Band')).toBeInTheDocument()
      expect(screen.getByText('Test Event')).toBeInTheDocument()
      expect(screen.getByText('Song One')).toBeInTheDocument()
      expect(screen.getByText('Opening song')).toBeInTheDocument()
      
      // Check for MQTN-specific classes
      const container = document.querySelector('.mqtn.setlist.inverted.paper.container')
      expect(container).toBeInTheDocument()
    })

    it('should render BasicSetlist for basic theme', () => {
      render(<SetListProxy {...baseSetlist} theme="basic" qrCodeURL={mockQrCodeURL} />)
      
      expect(screen.getByText('Test Band')).toBeInTheDocument()
      expect(screen.getByText('Test Event')).toBeInTheDocument()
      expect(screen.getByText('Song One')).toBeInTheDocument()
      
      // Check for Basic-specific styling
      const container = document.querySelector('.mqtn.setlist.container.theme-basic')
      expect(container).toBeInTheDocument()
    })

    it('should render MinimalSetlist for minimal theme', () => {
      render(<SetListProxy {...baseSetlist} theme="minimal" qrCodeURL={mockQrCodeURL} />)
      
      expect(screen.getByText('Test Band')).toBeInTheDocument()
      expect(screen.getByText('Test Event')).toBeInTheDocument()
      expect(screen.getByText('Song One')).toBeInTheDocument()
      
      // Check for Minimal-specific styling
      const container = document.querySelector('.minimal.setlist.container.theme-minimal')
      expect(container).toBeInTheDocument()
    })
  })

  describe('content rendering', () => {
    it('should render band name and event name', () => {
      render(<SetListProxy {...baseSetlist} qrCodeURL={mockQrCodeURL} />)
      
      expect(screen.getByText('Test Band')).toBeInTheDocument()
      expect(screen.getByText('Test Event')).toBeInTheDocument()
    })

    it('should render all songs in playings list', () => {
      render(<SetListProxy {...baseSetlist} qrCodeURL={mockQrCodeURL} />)
      
      expect(screen.getByText('Song One')).toBeInTheDocument()
      expect(screen.getByText('Song Two')).toBeInTheDocument()
      expect(screen.getByText('Opening song')).toBeInTheDocument()
    })

    it('should render QR code image', () => {
      render(<SetListProxy {...baseSetlist} qrCodeURL={mockQrCodeURL} />)
      
      const qrImage = screen.getByAltText('qrcode for setlist')
      expect(qrImage).toBeInTheDocument()
      expect(qrImage).toHaveAttribute('src', mockQrCodeURL)
    })

    it('should render event details when provided', () => {
      render(<SetListProxy {...baseSetlist} qrCodeURL={mockQrCodeURL} />)
      
      expect(screen.getByText('2024-01-01')).toBeInTheDocument()
      expect(screen.getByText(/OPEN 18:00.*START: 19:00/)).toBeInTheDocument()
    })

    it('should handle missing optional event details', () => {
      const setlistWithoutDetails = {
        ...baseSetlist,
        event: {
          name: 'Simple Event',
          date: '',
          openTime: '',
          startTime: ''
        }
      }
      
      render(<SetListProxy {...setlistWithoutDetails} qrCodeURL={mockQrCodeURL} />)
      
      expect(screen.getByText('Simple Event')).toBeInTheDocument()
      expect(screen.queryByText(/OPEN.*START/)).not.toBeInTheDocument()
    })
  })

  describe('dynamic font sizing', () => {
    it('should apply larger font size for fewer songs', () => {
      const shortSetlist = {
        ...baseSetlist,
        playings: [
          { _id: '1', title: 'Only Song', note: '' }
        ]
      }
      
      render(<SetListProxy {...shortSetlist} qrCodeURL={mockQrCodeURL} />)
      
      const songElement = screen.getByText('Only Song')
      expect(songElement).toHaveStyle({ fontSize: '2em' })
    })

    it('should apply smaller font size for many songs', () => {
      const longSetlist = {
        ...baseSetlist,
        playings: Array.from({ length: 35 }, (_, i) => ({
          _id: String(i + 1),
          title: `Song ${i + 1}`,
          note: ''
        }))
      }
      
      render(<SetListProxy {...longSetlist} qrCodeURL={mockQrCodeURL} />)
      
      const firstSong = screen.getByText('Song 1')
      expect(firstSong).toHaveStyle({ fontSize: '0.75em' })
    })
  })

  describe('minimal theme specific features', () => {
    it('should render numbered songs in minimal theme', () => {
      render(<SetListProxy {...baseSetlist} theme="minimal" qrCodeURL={mockQrCodeURL} />)
      
      expect(screen.getByText('01.')).toBeInTheDocument()
      expect(screen.getByText('02.')).toBeInTheDocument()
    })

    it('should render notes with special styling in minimal theme', () => {
      render(<SetListProxy {...baseSetlist} theme="minimal" qrCodeURL={mockQrCodeURL} />)
      
      const noteElement = screen.getByText('Opening song')
      expect(noteElement).toHaveStyle({ 
        color: 'rgb(102, 102, 102)',
        fontStyle: 'italic'
      })
    })
  })
})

describe('captureNode', () => {
  it('should capture HTML element as blob', async () => {
    const mockElement = document.createElement('div')
    mockElement.innerHTML = '<p>Test content</p>'
    
    const result = await captureNode(mockElement)
    
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('image/png')
  })
})