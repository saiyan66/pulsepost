function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })
}

function initials(username) {
  return (username || '?').slice(0, 2).toUpperCase()
}

export default function PostCard({ post, onClick, onDelete, onAuthorClick, index = 0 }) {
  const isOwner = onDelete !== undefined

  return (
    <article
      onClick={onClick}
      style={{
        padding: '28px 32px',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background 0.1s',
        animation: `fadeUp 0.3s ease ${index * 0.05}s both`,
        position: 'relative',
      }}
      onMouseOver={e => e.currentTarget.style.background = 'var(--bg2)'}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    >
  
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
      }}>
        <div style={{
          width: 30, height: 30,
          borderRadius: '50%',
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--accent)',
          fontWeight: 500,
          flexShrink: 0,
        }}>
          {initials(post.author?.username)}
        </div>
        <span
          onClick={e => {
            e.stopPropagation()   // don't open the post
            if (onAuthorClick) onAuthorClick(post.author?.id)
          }}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: 'var(--text2)',
            fontWeight: 500,
            cursor: onAuthorClick ? 'pointer' : 'default',
            textDecoration: onAuthorClick ? 'underline' : 'none',
            textUnderlineOffset: 3,
          }}
        >
          @{post.author?.username || 'unknown'}
        </span>
        <span style={{ color: 'var(--border2)', fontSize: 10 }}>·</span>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--text3)',
        }}>
          {timeAgo(post.created_at)}
        </span>

     
        {isOwner && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(post.id) }}
            style={{
              marginLeft: 'auto',
              padding: '2px 8px',
              background: 'transparent',
              color: 'var(--text3)',
              border: '1px solid transparent',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'all 0.1s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.color = 'var(--danger)'
              e.currentTarget.style.borderColor = 'var(--danger)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.color = 'var(--text3)'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            delete
          </button>
        )}
      </div>

      <h2 style={{
        fontFamily: 'var(--serif)',
        fontSize: 20,
        fontWeight: 400,
        color: 'var(--ink)',
        lineHeight: 1.3,
        marginBottom: 8,
        letterSpacing: '-0.01em',
      }}>
        {post.title}
      </h2>

  
      <p style={{
        fontSize: 14,
        color: 'var(--text2)',
        lineHeight: 1.7,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        marginBottom: 14,
      }}>
        {post.content}
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--accent)',
          letterSpacing: '0.04em',
        }}>
          Read →
        </span>
        {post.likes_count > 0 && (
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--text3)',
          }}>
            {post.likes_count} likes
          </span>
        )}
      </div>
    </article>
  )
}